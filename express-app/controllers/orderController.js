function createOrder(req, res) {

    // Basic validation
    if (typeof name !== 'string' || name.trim() === '') {
        return res.status(400).json({ error: 'Name is required' });
    }

    const phoneRegex = /^[0-9]{10}$/; // Adjust regex as needed
    if (!phoneRegex.test(phone)) {
        return res.status(400).json({ error: 'Valid phone number is required' });
    }

    if (!Array.isArray(lessons) || lessons.length === 0) {
        return res.status(400).json({ error: 'At least one lesson is required' });
    }

    for (const item of lessons) {
        if (!item.lessonId || !ObjectId.isValid(item.lessonId)) {
            return res.status(400).json({ error: 'Valid lesson ID is required' });
        }
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
            return res.status(400).json({ error: 'Quantity must be a positive integer' });
        }
    }

}
