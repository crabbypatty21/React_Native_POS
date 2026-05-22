require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js'); 

const app = express();
const PORT = 3000;

// This allows your API to understand JSON data sent from the app
app.use(express.json());

// --- SUPABASE SETUP ---
// Using dotenv to load your credentials securely from the .env file
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// --- ROUTES ---

// 1. Fetch Products from Supabase
app.get('/Products', async (req, res) => {
    try {
        // This asks Supabase for all rows in your Products table
        const { data, error } = await supabase
            .from('Products') 
            .select('*');

        if (error) {
            console.error("Supabase Error:", error);
            return res.status(400).json({ error: error.message });
        }

        // Send the real database items to your React Native app
        res.json(data);
    } catch (err) {
        console.error("Server error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// 2. Process Checkout
app.post('/checkout', async (req, res) => {
    const { items, total } = req.body;
    
    try {
        // 1. Insert a new record into a 'Sales' table
        const { data: saleData, error: saleError } = await supabase
            .from('Sales')
            .insert([{ total_amount: total }])
            .select();

        if (saleError) throw saleError;
        
        const saleId = saleData[0].id;

        // 2. Insert the individual items (soaps/powders) into a 'Sale_Items' table
        const saleItems = items.map(item => ({
            sale_id: saleId,
            product_id: item.product_id, 
            price_at_time: item.product_price
        }));

        const { error: itemsError } = await supabase
            .from('Sale_Items')
            .insert(saleItems);

        if (itemsError) throw itemsError;

        res.json({ success: true, message: "Sale recorded successfully!" });
    } catch (err) {
        console.error("Checkout error:", err);
        res.status(500).json({ error: "Checkout failed" });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Backend is running at http://localhost:${PORT}`);
});