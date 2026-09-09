import Collection from "../models/Collection.js";
import Batch from "../models/Batch.js";
import Member from "../models/Member.js";
import Group from "../models/Group.js";
import Organisation from "../models/Organisation.js";
import { ApiError } from "../middleware/error.middleware.js";

export const getCollections = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const { crop, memberId, groupId, batchId, from, to, search } = req.query;

    const filter = {};
    if (crop) filter.crop = { $regex: crop, $options: "i" };
    if (memberId) filter.memberId = memberId;
    if (batchId) {
      // 'none' is a special value meaning "not yet assigned to a batch".
      filter.batchId = batchId === "none" ? null : batchId;
    }

    // Both groupId and a member-name search reduce the query to a set of
    // member ids first, then match collections whose member is in that set.
    let memberFilter = null;
    if (groupId || search) {
      const conditions = [];
      if (groupId) conditions.push({ groupId });
      if (search) {
        const rx = { $regex: search, $options: "i" };
        conditions.push({
          $or: [
            { firstName: rx },
            { lastName: rx },
            { phone: rx },
            { membershipNumber: rx },
          ],
        });
      }
      const members = await Member.find(
        conditions.length === 1 ? conditions[0] : { $and: conditions },
      ).select("_id");
      memberFilter = { memberId: { $in: members.map((m) => m._id) } };
    }

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const combined = { ...filter, ...memberFilter };
    const skip = (page - 1) * limit;
    const total = await Collection.countDocuments(combined);

    const collections = await Collection.find(combined)
      .populate("memberId", "firstName lastName phone membershipNumber")
      .populate("capturedBy", "name")
      .populate("batchId", "batchNumber")
      .sort("-date")
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      count: collections.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: collections,
    });
  } catch (error) {
    next(error);
  }
};

export const getCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate("memberId", "firstName lastName phone membershipNumber groupId")
      .populate("capturedBy", "name");
    if (!collection) throw new ApiError(404, "Collection not found");
    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const createCollection = async (req, res, next) => {
  try {
    const data = { ...req.body, capturedBy: req.user._id };

    if (req.file) {
      data.photo = `/uploads/collections/${req.file.filename}`;
    }

    // If no explicit price was supplied, fall back to the organisation's
    // configured default crop price (Organisation.settings.defaultCropPrices).
    // The defaultCropPrices field is a Mongoose Map, so it must be read with
    // .get() — direct property access with a name like "Cocoa" works too, but
    // .get() is the supported accessor for Map-type schema paths.
    let price = data.pricePerUnit;
    if (!price) {
      let fallback = 0;
      try {
        const org = req.user.organisationId
          ? await Organisation.findById(req.user.organisationId)
          : null;
        const map = org?.settings?.defaultCropPrices;
        if (map) {
          fallback = map.get ? map.get(data.crop) : map[data.crop];
        }
      } catch {
        // If the organisation lookup fails we simply record the collection
        // with the default price of 0; the visible quantity/grade are the
        // important parts of the record and can be relabelled later.
      }
      price = fallback || 0;
      data.pricePerUnit = price;
      data.totalValue = (data.quantity || 0) * price;
    }

    const collection = await Collection.create(data);
    res.status(201).json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const updateCollection = async (req, res, next) => {
  try {
    let data = { ...req.body };
    if (req.file) data.photo = `/uploads/collections/${req.file.filename}`;

    // Recompute totalValue here because findByIdAndUpdate bypasses the model's
    // pre-save hook (same limitation as payment updates).
    const existing = await Collection.findById(req.params.id);
    if (!existing) throw new ApiError(404, "Collection not found");

    const qty = data.quantity !== undefined ? data.quantity : existing.quantity;
    const price =
      data.pricePerUnit !== undefined
        ? data.pricePerUnit
        : existing.pricePerUnit;
    data.totalValue = qty * price;

    const collection = await Collection.findByIdAndUpdate(req.params.id, data, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: collection });
  } catch (error) {
    next(error);
  }
};

export const deleteCollection = async (req, res, next) => {
  try {
    const collection = await Collection.findByIdAndDelete(req.params.id);
    if (!collection) throw new ApiError(404, "Collection not found");
    res.json({ success: true, message: "Collection removed" });
  } catch (error) {
    next(error);
  }
};

// Assigns collections to a shipping batch. If the batch number doesn't
// exist yet it's created on the fly (status 'open'). After assigning, the
// batch's totalWeight is recomputed from all collections currently in it,
// so it stays correct even if collections are added incrementally over
// multiple calls.
export const addToBatch = async (req, res, next) => {
  try {
    const { collectionIds, batchNumber } = req.body;
    let batch = await Batch.findOne({ batchNumber });

    if (!batch) {
      batch = await Batch.create({
        batchNumber,
        status: "open",
        collectionPoint: req.body.collectionPoint,
        buyer: req.body.buyer,
        createdBy: req.user._id,
      });
    }

    const result = await Collection.updateMany(
      { _id: { $in: collectionIds } },
      { batchId: batch._id, batchNumber: batch.batchNumber },
    );

    const weight = await Collection.aggregate([
      { $match: { batchId: batch._id } },
      { $group: { _id: null, total: { $sum: "$quantity" } } },
    ]);
    batch.totalWeight = weight[0]?.total || 0;
    await batch.save();

    res.json({
      success: true,
      message: "Collections added to batch",
      data: batch,
    });
  } catch (error) {
    next(error);
  }
};

export const getBatches = async (req, res, next) => {
  try {
    const batches = await Batch.find()
      .populate("createdBy", "name")
      .sort("-createdAt");
    res.json({ success: true, count: batches.length, data: batches });
  } catch (error) {
    next(error);
  }
};

export const getBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) throw new ApiError(404, "Batch not found");
    const collections = await Collection.find({ batchId: batch._id }).populate(
      "memberId",
      "firstName lastName phone membershipNumber location",
    );
    res.json({ success: true, data: { ...batch.toObject(), collections } });
  } catch (error) {
    next(error);
  }
};

// Updates batch metadata/status (dispatch/close/...). Once a batch has been
// closed it cannot be reopened — a closed batch is a snapshot heading to
// market, so its status only moves forward (closed -> shipped -> delivered).
export const updateBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) throw new ApiError(404, "Batch not found");

    const allowed = ["status", "collectionPoint", "buyer", "certification"];
    for (const key of allowed) {
      if (req.body[key] !== undefined) batch[key] = req.body[key];
    }

    if (batch.status === "open" && req.body.status === "closed") {
      batch.status = "closed";
    }

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    next(error);
  }
};

// Removes a batch and unassigns every collection that referenced it, so a
// deleted batch never leaves orphaned batchId references behind.
export const deleteBatch = async (req, res, next) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) throw new ApiError(404, "Batch not found");

    await Collection.updateMany(
      { batchId: batch._id },
      { $unset: { batchId: 1, batchNumber: 1 } },
    );
    await batch.deleteOne();

    res.json({ success: true, message: "Batch removed" });
  } catch (error) {
    next(error);
  }
};
