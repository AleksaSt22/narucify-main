#!/usr/bin/env python3

import requests
import sys
import json
from datetime import datetime
import uuid

class DMOrderSystemTester:
    def __init__(self, base_url="https://seller-order-hub.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []
        
        # Test data storage
        self.test_user_email = f"test_{datetime.now().strftime('%H%M%S')}@example.com"
        self.test_password = "TestPass123!"
        self.test_business = "Test Business"
        self.created_product_id = None
        self.created_order_id = None
        self.order_link_token = None

    def log_result(self, test_name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {test_name}")
        else:
            print(f"❌ {test_name} - {details}")
        
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })

    def make_request(self, method, endpoint, data=None, headers=None, expect_status=200):
        """Make HTTP request with error handling"""
        url = f"{self.base_url}/{endpoint}"
        
        # Default headers
        req_headers = {'Content-Type': 'application/json'}
        if self.token:
            req_headers['Authorization'] = f'Bearer {self.token}'
        if headers:
            req_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=req_headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=req_headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=req_headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=req_headers)
            else:
                return False, f"Unsupported method: {method}"

            success = response.status_code == expect_status
            return success, response.json() if success else f"Status: {response.status_code}, Response: {response.text}"

        except Exception as e:
            return False, f"Request failed: {str(e)}"

    # ==================== AUTH TESTS ====================
    
    def test_user_registration(self):
        """Test user registration"""
        success, result = self.make_request('POST', 'auth/register', {
            "email": self.test_user_email,
            "password": self.test_password,
            "business_name": self.test_business
        }, expect_status=200)
        
        if success and 'token' in result:
            self.token = result['token']
            self.user_id = result['user']['id']
            self.log_result("User Registration", True)
            return True
        else:
            self.log_result("User Registration", False, str(result))
            return False

    def test_user_login(self):
        """Test user login"""
        success, result = self.make_request('POST', 'auth/login', {
            "email": self.test_user_email,
            "password": self.test_password
        }, expect_status=200)
        
        if success and 'token' in result:
            self.token = result['token']
            self.user_id = result['user']['id']
            self.log_result("User Login", True)
            return True
        else:
            self.log_result("User Login", False, str(result))
            return False

    def test_get_current_user(self):
        """Test get current user"""
        success, result = self.make_request('GET', 'auth/me', expect_status=200)
        
        if success and result.get('email') == self.test_user_email:
            self.log_result("Get Current User", True)
            return True
        else:
            self.log_result("Get Current User", False, str(result))
            return False

    # ==================== PRODUCTS TESTS ====================
    
    def test_create_product(self):
        """Test product creation"""
        product_data = {
            "name": "Test Product",
            "description": "A test product for testing",
            "price": 99.99,
            "stock": 10,
            "image_url": "https://example.com/test.jpg"
        }
        
        success, result = self.make_request('POST', 'products', product_data, expect_status=200)
        
        if success and 'id' in result:
            self.created_product_id = result['id']
            self.log_result("Create Product", True)
            return True
        else:
            self.log_result("Create Product", False, str(result))
            return False

    def test_get_products(self):
        """Test get products list"""
        success, result = self.make_request('GET', 'products', expect_status=200)
        
        if success and isinstance(result, list):
            self.log_result("Get Products List", True)
            return True
        else:
            self.log_result("Get Products List", False, str(result))
            return False

    def test_get_single_product(self):
        """Test get single product"""
        if not self.created_product_id:
            self.log_result("Get Single Product", False, "No product ID available")
            return False
            
        success, result = self.make_request('GET', f'products/{self.created_product_id}', expect_status=200)
        
        if success and result.get('id') == self.created_product_id:
            self.log_result("Get Single Product", True)
            return True
        else:
            self.log_result("Get Single Product", False, str(result))
            return False

    def test_update_product(self):
        """Test product update"""
        if not self.created_product_id:
            self.log_result("Update Product", False, "No product ID available")
            return False
            
        update_data = {
            "name": "Updated Test Product",
            "price": 149.99,
            "stock": 15
        }
        
        success, result = self.make_request('PUT', f'products/{self.created_product_id}', update_data, expect_status=200)
        
        if success and result.get('name') == "Updated Test Product":
            self.log_result("Update Product", True)
            return True
        else:
            self.log_result("Update Product", False, str(result))
            return False

    # ==================== ORDERS TESTS ====================
    
    def test_create_order(self):
        """Test order creation"""
        if not self.created_product_id:
            self.log_result("Create Order", False, "No product ID available")
            return False
            
        order_data = {
            "items": [
                {
                    "product_id": self.created_product_id,
                    "quantity": 2
                }
            ],
            "notes": "Test order notes"
        }
        
        success, result = self.make_request('POST', 'orders', order_data, expect_status=200)
        
        if success and 'id' in result and 'link_token' in result:
            self.created_order_id = result['id']
            self.order_link_token = result['link_token']
            self.log_result("Create Order", True)
            return True
        else:
            self.log_result("Create Order", False, str(result))
            return False

    def test_get_orders(self):
        """Test get orders list"""
        success, result = self.make_request('GET', 'orders', expect_status=200)
        
        if success and isinstance(result, list):
            self.log_result("Get Orders List", True)
            return True
        else:
            self.log_result("Get Orders List", False, str(result))
            return False

    def test_get_single_order(self):
        """Test get single order"""
        if not self.created_order_id:
            self.log_result("Get Single Order", False, "No order ID available")
            return False
            
        success, result = self.make_request('GET', f'orders/{self.created_order_id}', expect_status=200)
        
        if success and result.get('id') == self.created_order_id:
            self.log_result("Get Single Order", True)
            return True
        else:
            self.log_result("Get Single Order", False, str(result))
            return False

    def test_update_order_status(self):
        """Test order status update"""
        if not self.created_order_id:
            self.log_result("Update Order Status", False, "No order ID available")
            return False
            
        success, result = self.make_request('PUT', f'orders/{self.created_order_id}/status', 
                                          {"status": "confirmed"}, expect_status=200)
        
        if success and result.get('status') == "confirmed":
            self.log_result("Update Order Status", True)
            return True
        else:
            self.log_result("Update Order Status", False, str(result))
            return False

    # ==================== PUBLIC ORDER TESTS ====================
    
    def test_get_public_order(self):
        """Test get public order"""
        if not self.order_link_token:
            self.log_result("Get Public Order", False, "No link token available")
            return False
            
        success, result = self.make_request('GET', f'public/order/{self.order_link_token}', expect_status=200)
        
        if success and 'order_number' in result and 'items' in result:
            self.log_result("Get Public Order", True)
            return True
        else:
            self.log_result("Get Public Order", False, str(result))
            return False

    def test_confirm_public_order(self):
        """Test public order confirmation"""
        if not self.order_link_token:
            self.log_result("Confirm Public Order", False, "No link token available")
            return False
            
        # First, reset order status to pending_customer
        self.make_request('PUT', f'orders/{self.created_order_id}/status', 
                         {"status": "pending_customer"}, expect_status=200)
        
        customer_data = {
            "full_name": "Test Customer",
            "phone": "+381601234567",
            "address": "Test Address 123",
            "city": "Belgrade",
            "postal_code": "11000",
            "email": "customer@test.com",
            "subscribe_promo": True,
            "payment_method": "cash_on_delivery"
        }
        
        success, result = self.make_request('POST', f'public/order/{self.order_link_token}/confirm', 
                                          customer_data, expect_status=200)
        
        if success and result.get('success') == True:
            self.log_result("Confirm Public Order", True)
            return True
        else:
            self.log_result("Confirm Public Order", False, str(result))
            return False

    # ==================== DASHBOARD & CUSTOMERS TESTS ====================
    
    def test_dashboard_stats(self):
        """Test dashboard statistics"""
        success, result = self.make_request('GET', 'dashboard/stats', expect_status=200)
        
        expected_fields = ['total_orders', 'pending_orders', 'completed_orders', 
                          'total_revenue', 'total_products', 'low_stock_products', 'total_customers']
        
        if success and all(field in result for field in expected_fields):
            self.log_result("Dashboard Stats", True)
            return True
        else:
            self.log_result("Dashboard Stats", False, str(result))
            return False

    def test_get_customers(self):
        """Test get customers list"""
        success, result = self.make_request('GET', 'customers', expect_status=200)
        
        if success and isinstance(result, list):
            self.log_result("Get Customers List", True)
            return True
        else:
            self.log_result("Get Customers List", False, str(result))
            return False

    # ==================== STOCK VERIFICATION ====================
    
    def test_stock_decrease_after_confirmation(self):
        """Test that stock decreases after order confirmation"""
        if not self.created_product_id:
            self.log_result("Stock Decrease Verification", False, "No product ID available")
            return False
            
        # Get current stock
        success, product = self.make_request('GET', f'products/{self.created_product_id}', expect_status=200)
        
        if success:
            # Stock should be 13 (15 - 2 from order confirmation)
            expected_stock = 13
            actual_stock = product.get('stock', 0)
            
            if actual_stock == expected_stock:
                self.log_result("Stock Decrease Verification", True)
                return True
            else:
                self.log_result("Stock Decrease Verification", False, 
                              f"Expected stock: {expected_stock}, Actual: {actual_stock}")
                return False
        else:
            self.log_result("Stock Decrease Verification", False, str(product))
            return False

    # ==================== CLEANUP ====================
    
    def cleanup(self):
        """Clean up test data"""
        # Delete test product
        if self.created_product_id:
            self.make_request('DELETE', f'products/{self.created_product_id}', expect_status=200)
        
        # Delete test order
        if self.created_order_id:
            self.make_request('DELETE', f'orders/{self.created_order_id}', expect_status=200)

    # ==================== MAIN TEST RUNNER ====================
    
    def run_all_tests(self):
        """Run all tests in sequence"""
        print("🚀 Starting DM Order System API Tests")
        print(f"📡 Testing API at: {self.base_url}")
        print("=" * 60)
        
        # Auth Tests
        print("\n🔐 Authentication Tests")
        if not self.test_user_registration():
            print("❌ Registration failed - stopping tests")
            return False
            
        self.test_get_current_user()
        
        # Test login with existing user
        self.test_user_login()
        
        # Products Tests
        print("\n📦 Products Tests")
        self.test_create_product()
        self.test_get_products()
        self.test_get_single_product()
        self.test_update_product()
        
        # Orders Tests
        print("\n🛒 Orders Tests")
        self.test_create_order()
        self.test_get_orders()
        self.test_get_single_order()
        self.test_update_order_status()
        
        # Public Order Tests
        print("\n🌐 Public Order Tests")
        self.test_get_public_order()
        self.test_confirm_public_order()
        
        # Stock Verification
        print("\n📊 Stock Management Tests")
        self.test_stock_decrease_after_confirmation()
        
        # Dashboard & Customers Tests
        print("\n📈 Dashboard & Customers Tests")
        self.test_dashboard_stats()
        self.test_get_customers()
        
        # Cleanup
        print("\n🧹 Cleanup")
        self.cleanup()
        
        # Results Summary
        print("\n" + "=" * 60)
        print(f"📊 Test Results: {self.tests_passed}/{self.tests_run} passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print("❌ Some tests failed")
            failed_tests = [r for r in self.test_results if not r['success']]
            print("\nFailed tests:")
            for test in failed_tests:
                print(f"  - {test['test']}: {test['details']}")
            return False

def main():
    """Main function"""
    tester = DMOrderSystemTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())