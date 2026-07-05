/**
 * 角色菜单配置 —— 不同角色看到不同的侧边栏菜单
 *
 * 每个菜单项：
 * - path: 路由路径
 * - label: 显示文字
 * - icon: Element Plus 图标名
 */

export interface MenuItem {
  path: string
  label: string
  icon: string
}

export const menuConfig: Record<string, MenuItem[]> = {
  admin: [
    { path: '/home', label: '首页', icon: 'HomeFilled' },
    { path: '/admin/users', label: '用户管理', icon: 'UserFilled' },
    { path: '/study-rooms', label: '自习室管理', icon: 'School' },
    { path: '/study-rooms/admin-reservations', label: '预约记录', icon: 'List' },
  ],
  teacher: [],
  student: [
    { path: '/home', label: '首页', icon: 'HomeFilled' },
    { path: '/study-rooms/reserve', label: '预约座位', icon: 'Calendar' },
    { path: '/study-rooms/my-reservations', label: '我的预约', icon: 'List' },
  ],
}
