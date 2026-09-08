import dns from "dns";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Mongoose resolves the SRV record of a mongodb+srv:// URI using the system
// DNS resolver, which fails on some local machines (or flaky networks).
// DNS_SERVERS lets the operator pin explicit resolvers (e.g. 8.8.8.8) so the
// connection does not depend on the host's configured DNS. This was added as
// a practical workaround during local development; it only matters for SRV
// form connection strings.
const configureDns = () => {
  const { DNS_SERVERS } = process.env;
  const dnsServers = (DNS_SERVERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  if (dnsServers.length > 0) {
    dns.setServers(dnsServers);
    console.log(`Using custom DNS servers: ${dnsServers.join(", ")}`);
  } else {
    console.log(
      `Using system DNS servers: ${dns.getServers().join(", ") || "system default"}`,
    );
  }
};

export const connectDB = async () => {
  configureDns();

  // The connection string may omit the database path (e.g. a manual
  // mongodb://host:27017 URI with no trailing /<db>). In that case MongoDB
  // silently connects to the "test" database and every query hits empty
  // collections — logins fail, dashboards show nothing. Default the database
  // name (DB_NAME env, falling back to "konnectcore") when the path is absent
  // so a missing segment can't cause that behavior. String surgery on the
  // pre-query portion avoids re-serializing the whole URI (which could encode
  // credentials differently).
  let uri = process.env.MONGODB_URI.trim();
  const dbName = process.env.DB_NAME || "konnectcore";
  const queryIdx = uri.indexOf("?");
  const head = queryIdx === -1 ? uri : uri.slice(0, queryIdx);
  // The authority (everything between :// and the first / or end) may look
  // like a path segment (e.g. "user:pass@host:27017"), so only a slash that
  // is NOT the trailing character counts as an explicit database path.
  const authorityTail = head.slice(head.indexOf("://") + 3);
  const hasDbPath = authorityTail.includes("/") && !authorityTail.endsWith("/");
  if (!hasDbPath) {
    const prefix = head.endsWith("/") ? head : `${head}/`;
    uri = `${prefix}${dbName}${queryIdx === -1 ? "" : uri.slice(queryIdx)}`;
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(
      "\n==========================================================",
    );
    console.error("MongoDB connection failed");
    console.error(`Reason: ${error.message}`);
    console.error(
      "If using a mongodb+srv:// URI, the SRV DNS record could not be",
      "resolved on this machine.",
    );
    console.error("Troubleshooting:");
    console.error(
      "  1. Check that MONGODB_URI in server/.env is correct and the database is reachable.",
    );
    console.error(
      "  2. If DNS resolution is unreliable, set DNS_SERVERS to one or more resolvers",
    );
    console.error(
      "     (comma-separated IPs), e.g. DNS_SERVERS=8.8.8.8,1.1.1.1",
    );
    console.error(
      "  3. If SRV records cannot be resolved at all, use a direct mongodb:// connection",
    );
    console.error("     string or a local MongoDB instance instead.");
    console.error(
      "==========================================================\n",
    );
    process.exit(1);
  }
};
