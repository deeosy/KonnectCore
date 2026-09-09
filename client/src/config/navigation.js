import {
  LayoutDashboard,
  Users,
  UserPlus,
  Layers,
  Sprout,
  PackageCheck,
  Wallet,
  Receipt,
  HandCoins,
  MapPinned,
  Settings,
  BarChart3,
} from 'lucide-react'

export const navSections = [
  {
    title: 'Overview',
    items: [{ name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'manager', 'fieldOfficer'] }],
  },
  {
    title: 'Management',
    items: [
      { name: 'Members', path: '/members', icon: Users, roles: ['admin', 'manager', 'fieldOfficer'] },
      { name: 'Register Member', path: '/members/new', icon: UserPlus, roles: ['admin', 'manager', 'fieldOfficer'] },
      { name: 'Groups', path: '/groups', icon: Layers, roles: ['admin', 'manager'] },
      { name: 'Farms & Crops', path: '/farms', icon: Sprout, roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'Operations',
    items: [
      { name: 'Collections', path: '/collections', icon: PackageCheck, roles: ['admin', 'manager', 'fieldOfficer'] },
      { name: 'Payments', path: '/payments', icon: Wallet, roles: ['admin', 'manager'] },
      { name: 'Expenses', path: '/expenses', icon: Receipt, roles: ['admin', 'manager'] },
      { name: 'Loans', path: '/loans', icon: HandCoins, roles: ['admin', 'manager'] },
      { name: 'Field Visits', path: '/visits', icon: MapPinned, roles: ['admin', 'manager', 'fieldOfficer'] },
    ],
  },
  {
    title: 'Insights',
    items: [
      { name: 'Reports', path: '/reports', icon: BarChart3, roles: ['admin', 'manager'] },
    ],
  },
  {
    title: 'System',
    items: [
      { name: 'Users', path: '/users', icon: Settings, roles: ['admin'] },
    ],
  },
]

export const allNavItems = navSections.flatMap((s) => s.items)
