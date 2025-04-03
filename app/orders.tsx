import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  Modal, 
  StyleSheet, 
  ActivityIndicator,
  Image,
  ScrollView,
  Dimensions
} from "react-native";
import apiInstance from './Plugins/api';
import moment from "moment";
import { getUserId } from '../components/getUserId';

const { width, height } = Dimensions.get('window');

const OrdersScreen = () => {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const initialize = async () => {
      try {
        const id = await getUserId();
        setUserId(id);
        
        if (id) {
          fetchOrders(id);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        setLoading(false);
      }
    };

    initialize();
  }, []);

  const fetchOrders = async (userId) => {
    try {
      setLoading(true);
      const response = await apiInstance.get(`customer/orders/${userId}/`);
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error fetching orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    if (!userId) return;
    
    try {
      setDetailLoading(true);
      const response = await apiInstance.get(`customer/order/${userId}/${orderId}/`);
      setSelectedOrder(response.data);
      setOrderItems(response.data.orderitem || []);
      setModalVisible(true);
    } catch (error) {
      console.error("Error fetching order details:", error);
    } finally {
      setDetailLoading(false);
    }
  };

  const statusCounts = orders?.length
    ? orders.reduce((counts, order) => {
        counts[order.order_status] = (counts[order.order_status] || 0) + 1;
        return counts;
      }, {})
    : { pending: 0, fulfilled: 0 };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Your Orders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#FF8C33" />
      ) : (
        <>
          <View style={styles.summaryRow}>
            <View style={[styles.summaryItem, { backgroundColor: "#B2DFDB" }]}>
              <Text style={styles.summaryLabel}>Orders</Text>
              <Text style={styles.summaryValue}>{orders.length}</Text>
            </View>
            
            <View style={[styles.summaryItem, { backgroundColor: "#D1C4E9" }]}>
              <Text style={styles.summaryLabel}>Pending</Text>
              <Text style={styles.summaryValue}>{statusCounts.pending || 0}</Text>
            </View>
            
            <View style={[styles.summaryItem, { backgroundColor: "#BBDEFB" }]}>
              <Text style={styles.summaryLabel}>Fulfilled</Text>
              <Text style={styles.summaryValue}>{statusCounts.fulfilled || 0}</Text>
            </View>
          </View>

          {orders.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No orders found</Text>
            </View>
          ) : (
            <FlatList
              data={orders}
              keyExtractor={(item) => item.oid.toString()}
              contentContainerStyle={styles.listContentContainer}
              renderItem={({ item }) => (
                <View style={styles.orderCard}>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>Order #{item.oid}</Text>
                    <Text style={styles.orderDate}>{moment(item.date).format("MMM Do, YYYY")}</Text>
                  </View>
                  
                  <View style={styles.orderStatusRow}>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusText}>{item.payment_status.toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: '#E3F2FD' }]}>
                      <Text style={[styles.statusText, { color: '#0D47A1' }]}>{item.order_status}</Text>
                    </View>
                  </View>
                  
                  <Text style={styles.orderTotal}>Total: ${item.total}</Text>
                  
                  <View style={styles.buttonRow}>
                    <TouchableOpacity 
                      onPress={() => fetchOrderDetails(item.oid)} 
                      style={styles.actionButton}
                    >
                      <Text style={styles.buttonText}>View Details</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: '#4CAF50' }]}
                      onPress={() => console.log('Generate invoice')}
                    >
                      <Text style={styles.buttonText}>Invoice</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />
          )}
        </>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalOuterContainer}>
          <ScrollView 
            style={styles.modalContainer}
            contentContainerStyle={styles.modalContentContainer}
          >
            {detailLoading ? (
              <ActivityIndicator size="large" color="#FF8C33" />
            ) : (
              selectedOrder && (
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Order #{selectedOrder.oid}</Text>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Text style={styles.closeText}>✕</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.summaryContainer}>
                    <View style={[styles.summaryBox, { backgroundColor: "#B2DFDB" }]}>
                      <Text style={styles.summaryLabel}>Total</Text>
                      <Text style={styles.summaryValue}>${selectedOrder.total}</Text>
                    </View>
                    
                    <View style={[styles.summaryBox, { backgroundColor: "#D1C4E9" }]}>
                      <Text style={styles.summaryLabel}>Payment</Text>
                      <Text style={styles.summaryValue}>{selectedOrder.payment_status}</Text>
                    </View>
                    
                    <View style={[styles.summaryBox, { backgroundColor: "#BBDEFB" }]}>
                      <Text style={styles.summaryLabel}>Status</Text>
                      <Text style={styles.summaryValue}>{selectedOrder.order_status}</Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Shipping Information</Text>
                    <View style={styles.detailCard}>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Name: </Text>
                        {selectedOrder.full_name || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Address: </Text>
                        {selectedOrder.address || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>City: </Text>
                        {selectedOrder.city || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>State: </Text>
                        {selectedOrder.state || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Zip: </Text>
                        {selectedOrder.zipcode || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Country: </Text>
                        {selectedOrder.country || "N/A"}
                      </Text>
                      <Text style={styles.detailText}>
                        <Text style={styles.detailLabel}>Phone: </Text>
                        {selectedOrder.phone || "N/A"}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Order Breakdown</Text>
                    <View style={styles.breakdownCard}>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Subtotal:</Text>
                        <Text style={styles.breakdownValue}>${selectedOrder.sub_total || 0}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Shipping:</Text>
                        <Text style={styles.breakdownValue}>${selectedOrder.shipping_ammount || 0}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Tax:</Text>
                        <Text style={styles.breakdownValue}>${selectedOrder.tax_fee || 0}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={styles.breakdownLabel}>Service Fee:</Text>
                        <Text style={styles.breakdownValue}>${selectedOrder.service_fee || 0}</Text>
                      </View>
                      <View style={styles.breakdownRow}>
                        <Text style={[styles.breakdownLabel, styles.discountText]}>Discount:</Text>
                        <Text style={[styles.breakdownValue, styles.discountText]}>-${selectedOrder.saved || 0}</Text>
                      </View>
                      <View style={[styles.breakdownRow, styles.totalRow]}>
                        <Text style={[styles.breakdownLabel, styles.totalText]}>Total:</Text>
                        <Text style={[styles.breakdownValue, styles.totalText]}>${selectedOrder.total || 0}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.sectionTitle}>Order Items ({orderItems.length})</Text>
                    <FlatList
                      data={orderItems}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <View style={styles.orderItem}>
                          <Image 
                            source={{ uri: item.product?.image }} 
                            style={styles.productImage}
                          />
                          <View style={styles.itemInfo}>
                            <Text style={styles.itemTitle} numberOfLines={2}>{item.product?.title}</Text>
                            <Text style={styles.itemPrice}>${item.price} × {item.qty}</Text>
                          </View>
                          <Text style={styles.itemTotal}>${item.sub_total}</Text>
                        </View>
                      )}
                      keyExtractor={(item, index) => index.toString()}
                    />
                  </View>
                </View>
              )
            )}
          </ScrollView>
          
          {/* Fixed position back button */}
          {selectedOrder && (
            <View style={styles.fixedButtonContainer}>
              <TouchableOpacity 
                style={styles.backButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.backButtonText}>Back to Orders</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#333",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  listContentContainer: {
    paddingBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  summaryItem: {
    width: (width - 40) / 3,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#555",
    marginBottom: 5,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 8,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  orderDate: {
    fontSize: 14,
    color: "#666",
  },
  orderStatusRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  statusBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '500',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF8C33",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    backgroundColor: "#FF8C33",
    paddingVertical: 8,
    borderRadius: 6,
    flex: 1,
    marginHorizontal: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "500",
    fontSize: 14,
  },
  modalOuterContainer: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  modalContainer: {
    flex: 1,
  },
  modalContentContainer: {
    paddingBottom: 100, // Extra space for fixed button
  },
  modalContent: {
    padding: 15,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  closeText: {
    fontSize: 22,
    color: "#666",
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  summaryBox: {
    width: (width - 50) / 3,
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  detailCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailText: {
    fontSize: 14,
    marginBottom: 6,
    lineHeight: 20,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#555',
  },
  breakdownCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  breakdownRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  breakdownLabel: {
    fontSize: 14,
    color: '#555',
  },
  breakdownValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  totalRow: {
    borderBottomWidth: 0,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  discountText: {
    color: '#E53935',
  },
  totalText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  orderItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    alignItems: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  productImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemTitle: {
    fontWeight: '500',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 13,
    color: '#666',
  },
  itemTotal: {
    fontWeight: 'bold',
  },
  fixedButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  backButton: {
    backgroundColor: "#FF8C33",
    padding: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default OrdersScreen;