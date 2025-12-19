export const addCart = (product) => ({
    type: "ADDITEM",
    payload: product
});

export const delCart = (product) => ({
    type: "DELITEM",
    payload: product
});

export const setCart = (items) => ({
    type: "SET_CART",
    payload: items
});

export const emptyCart = () => ({
    type: "EMPTY_CART"
});
