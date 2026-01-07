import { IProduct } from "./IProduct";
import { IUser } from "./IUser";

export interface IAppContext {
    user: IUser | null;
    token: string | null;
    isAuthenticated: boolean;
    cart: IProduct[];

    setLogin: (user: IUser, token: string) => void;
    logout: () => void;
    addProductToCart: (product: IProduct) => void;
    removeProductFromCart: (id: number) => void;
    clearCart: () => void;
    getProductsQuantity: () => number;
    isIncludedInCart: (id: number) => boolean;
    getCartTotal: () => number;
    authAction: (func: () => void)=> void;
    getCartDiscount:() => number;
    getCartFinalTotal:() => number;

}
