// Function to get the orders collection from the database
function getOrdersCollection(db) {
    return db.collection('orders');
}

module.exports = { getOrdersCollection };
