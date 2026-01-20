import { IProduct } from "./IProduct";
import  { IUser } from "./IUser";

export interface IAppContext {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    cart: IProduct[];
    isAdmin: boolean;
    isSuperAdmin: boolean;

    setLogin: (user: IUser, token: string) => void;
    logout: () => void;
    login: (email: string, password: string) => Promise<any>;
    register: (userData: any, confirmPassword?: string) => Promise<any>;
    clearError:()=> void;
    addProductToCart: (product: IProduct) => void;
    removeProductFromCart: (id: number) => void;
    clearCart: () => void;
    getProductsQuantity: () => number;
    isIncludedInCart: (id: number) => boolean;
    getCartTotal: () => number;
    authAction: (func: () => void)=> void;
    getCartDiscount:() => number;
    getCartFinalTotal:() => number;
    fetchAdminStats?: () => Promise<any>;
    fetchAllUsers?: () => Promise<IUser[]>;
}
