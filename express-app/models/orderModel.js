const db = require('../index');

function getOrdersCollection() {
    return db.collection('orders');
}

module.exports = { getOrdersCollection };