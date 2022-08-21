import { MenuDocument } from '../../db/schema/menu';
export type Menu = Pick<MenuDocument, 'menuName' | 'menuUrl'>;

