import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. UPDATED TYPE: This now perfectly matches your Supabase table!
interface Products {
  id: number | string;
  product_name: string;
  product_price: number;
}

export default function App() {
  const [Products, setProducts] = useState<Products[]>([]);
  const [cart, setCart] = useState<Products[]>([]);

  useEffect(() => {
    fetch('http://192.168.1.16:3000/Products') 
      .then(response => response.json())
      .then(data => setProducts(data))
      .catch(error => console.error("Error loading products:", error));
  }, []);

  const addToCart = (Products: Products) => {
    setCart([...cart, Products]);
  };

  const calculateTotal = () => {
    // 2. Updated to calculate the total using product_price
    return cart.reduce((sum, item) => sum + item.product_price, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      return Alert.alert("Wait!", "The cart is empty.");
    }

    fetch('http://192.168.1.16:3000/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cart, total: calculateTotal() })
    })
    .then(response => response.json())
    .then(data => {
      Alert.alert("Success!", "Sale recorded.");
      setCart([]); 
    })
    .catch(error => console.error("Checkout failed:", error));
  };

  return (
    <SafeAreaView style={styles.container}>
      
      {/* Product Grid Section */}
      <View style={styles.gridSection}>
        <Text style={styles.header}>Products</Text>
        <FlatList
          data={Products}
          numColumns={2}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.productCard} onPress={() => addToCart(item)}>
              {/* 3. Updated to display product_name and product_price */}
              <Text style={styles.productName}>{item.product_name}</Text>
              <Text style={styles.productPrice}>${item.product_price}</Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Shopping Cart Section */}
      <View style={styles.cartSection}>
        <Text style={styles.header}>Cart ({cart.length} items)</Text>
        <FlatList
          data={cart}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.cartItem}>
              {/* 4. Updated the cart items to match as well */}
              <Text>{item.product_name}</Text>
              <Text>${item.product_price}</Text>
            </View>
          )}
        />
        
        <View style={styles.checkoutBar}>
          <Text style={styles.totalText}>Total: ${calculateTotal()}</Text>
          <TouchableOpacity style={styles.payButton} onPress={handleCheckout}>
            <Text style={styles.payButtonText}>PAY</Text>
          </TouchableOpacity>
        </View>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { fontSize: 20, fontWeight: 'bold', marginVertical: 10, paddingHorizontal: 10 },
  gridSection: { flex: 3, padding: 10 },
  productCard: { 
    flex: 1, backgroundColor: 'white', margin: 5, padding: 20, 
    borderRadius: 10, alignItems: 'center', elevation: 3 
  },
  productName: { fontSize: 18, fontWeight: '600' },
  productPrice: { fontSize: 16, color: 'gray', marginTop: 5 },
  cartSection: { flex: 2, backgroundColor: 'white', padding: 15, borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 10 },
  cartItem: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  checkoutBar: { marginTop: 15, borderTopWidth: 2, borderTopColor: '#000', paddingTop: 10 },
  totalText: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  payButton: { backgroundColor: '#4CAF50', padding: 15, borderRadius: 10, alignItems: 'center' },
  payButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});