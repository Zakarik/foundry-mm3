export function isSurcharge(surcharge, ...params) {
    const total = params.reduce((acc, param) => acc + param, 0);

    return surcharge ? surcharge : total;
}