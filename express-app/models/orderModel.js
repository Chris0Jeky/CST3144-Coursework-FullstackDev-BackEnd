function getOrdersCollection(db) {
    return db.collection('orders');
}

module.exports = { getOrdersCollection };