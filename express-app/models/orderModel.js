function getOrdersCollection() {
    return db.collection('orders');
}

module.exports = { getOrdersCollection };