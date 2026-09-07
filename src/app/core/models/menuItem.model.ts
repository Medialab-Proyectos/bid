export interface MenuItem {
  icon?: string;
  text?: string;
  routeTo?: string;
  selected?: boolean;
  separator?: boolean;
  index?: string;
  subIndex?: string;
  childs?: MenuItem[];
  items?: MenuItem[];
  isChild?: boolean;
}
