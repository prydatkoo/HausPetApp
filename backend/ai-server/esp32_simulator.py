"""
ESP32 Collar Data Simulator
Simulates real collar sensor data for testing the AI server
Created by Maryan - Full Stack Developer
"""

import requests
import json
import time
import random
import datetime
from typing import Dict

class ESP32Simulator:
    """Simulates ESP32 collar sending sensor data"""
    
    def __init__(self, server_url: str = "http://localhost:5000"):
        self.server_url = server_url
        self.collar_id = "COLLAR_001"
        self.pet_profiles = {
            "oscar": {
                "pet_id": "oscar_001",
                "species": "dog",
                "age": 3,
                "weight": 65,
                "baseline": {
                    "heart_rate": 80,
                    "temperature": 101.5,
                    "spo2": 98,
                    "activity": 6.0
                }
            },
            "luna": {
                "pet_id": "luna_001", 
                "species": "cat",
                "age": 2,
                "weight": 12,
                "baseline": {
                    "heart_rate": 160,
                    "temperature": 101.0,
                    "spo2": 97,
                    "activity": 4.0
                }
            }
        }
        self.current_pet = "oscar"
        self.scenario = "normal"  # normal, excited, sick, sleeping
    
    def generate_sensor_data(self) -> Dict:
        """Generate realistic sensor data based on current scenario"""
        pet = self.pet_profiles[self.current_pet]
        baseline = pet["baseline"]
        
        # Base readings
        heart_rate = baseline["heart_rate"]
        temperature = baseline["temperature"]
        spo2 = baseline["spo2"]
        activity = baseline["activity"]
        
        # Apply scenario modifications
        if self.scenario == "excited":
            heart_rate += random.randint(20, 50)
            activity += random.uniform(2.0, 4.0)
            temperature += random.uniform(0.5, 1.0)
        elif self.scenario == "sick":
            temperature += random.uniform(2.0, 4.0)  # Fever
            heart_rate += random.randint(15, 30)
            spo2 -= random.randint(3, 8)
            activity -= random.uniform(2.0, 4.0)
        elif self.scenario == "sleeping":
            heart_rate -= random.randint(10, 20)
            activity = random.uniform(0.0, 0.5)
            temperature -= random.uniform(0.2, 0.5)
        else:  # normal
            heart_rate += random.randint(-10, 10)
            temperature += random.uniform(-0.3, 0.3)
            spo2 += random.randint(-2, 2)
            activity += random.uniform(-1.0, 1.0)
        
        # Ensure realistic bounds
        heart_rate = max(30, min(250, heart_rate))
        temperature = max(95.0, min(106.0, temperature))
        spo2 = max(80, min(100, spo2))
        activity = max(0.0, min(10.0, activity))
        
        # Generate GPS coordinates (simulated movement around home)
        base_lat, base_lng = 40.7128, -74.0060  # NYC coordinates
        gps_lat = base_lat + random.uniform(-0.001, 0.001)
        gps_lng = base_lng + random.uniform(-0.001, 0.001)
        
        return {
            "collar_id": self.collar_id,
            "pet_id": pet["pet_id"],
            "pet_species": pet["species"],
            "pet_age": pet["age"],
            "pet_weight": pet["weight"],
            "timestamp": datetime.datetime.now().isoformat(),
            "heart_rate": int(heart_rate),
            "temperature": round(temperature, 1),
            "spo2": int(spo2),
            "activity_level": round(activity, 1),
            "gps_lat": gps_lat,
            "gps_lng": gps_lng,
            "battery_level": random.randint(20, 100)
        }
    
    def send_data_to_server(self, data: Dict) -> bool:
        """Send sensor data to AI server"""
        try:
            response = requests.post(
                f"{self.server_url}/api/collar/data",
                json=data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Data sent successfully for {data['pet_id']}")
                print(f"🏥 Health Score: {result['analysis']['health_score']}/100")
                print(f"⚠️  Severity: {result['analysis']['severity']}")
                print(f"🤖 AI Analysis: {result['analysis']['ai_analysis']}")
                print("-" * 60)
                return True
            else:
                print(f"❌ Server error: {response.status_code}")
                return False
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Connection error: {e}")
            return False
    
    def run_simulation(self, duration_minutes: int = 5, interval_seconds: int = 30):
        """Run collar simulation for specified duration"""
        print(f"🚀 Starting ESP32 Collar Simulation")
        print(f"⏱️  Duration: {duration_minutes} minutes")
        print(f"📡 Sending data every {interval_seconds} seconds")
        print(f"🐕 Current pet: {self.current_pet}")
        print(f"🎭 Scenario: {self.scenario}")
        print("=" * 60)
        
        end_time = time.time() + (duration_minutes * 60)
        
        while time.time() < end_time:
            # Generate and send sensor data
            sensor_data = self.generate_sensor_data()
            success = self.send_data_to_server(sensor_data)
            
            if not success:
                print("⚠️  Retrying in 10 seconds...")
                time.sleep(10)
                continue
            
            # Randomly change scenarios to simulate real life
            if random.random() < 0.1:  # 10% chance to change scenario
                scenarios = ["normal", "excited", "sick", "sleeping"]
                self.scenario = random.choice(scenarios)
                print(f"🎭 Scenario changed to: {self.scenario}")
            
            time.sleep(interval_seconds)
        
        print("🏁 Simulation completed!")
    
    def test_scenarios(self):
        """Test different health scenarios"""
        scenarios = ["normal", "excited", "sick", "sleeping"]
        
        for scenario in scenarios:
            print(f"\n🎭 Testing scenario: {scenario.upper()}")
            self.scenario = scenario
            
            for i in range(3):  # Send 3 readings per scenario
                sensor_data = self.generate_sensor_data()
                self.send_data_to_server(sensor_data)
                time.sleep(5)

def main():
    """Main function to run ESP32 simulation"""
    print("🔌 ESP32 Smart Collar Simulator")
    print("👨‍💻 Created by Maryan - Full Stack Developer")
    print()
    
    # Check if AI server is running
    simulator = ESP32Simulator()
    
    try:
        response = requests.get(f"{simulator.server_url}/api/health")
        if response.status_code == 200:
            print("✅ AI Server is running!")
            server_info = response.json()
            print(f"📊 Service: {server_info['service']}")
            print(f"🔢 Version: {server_info['version']}")
            print()
        else:
            print("❌ AI Server not responding")
            return
    except:
        print("❌ Cannot connect to AI Server. Make sure it's running on http://localhost:5000")
        return
    
    # Menu for user interaction
    while True:
        print("\n🎮 Choose simulation mode:")
        print("1. Normal monitoring (5 minutes)")
        print("2. Test all health scenarios")
        print("3. Switch pet (Oscar/Luna)")
        print("4. Custom scenario")
        print("5. Exit")
        
        choice = input("\nEnter your choice (1-5): ").strip()
        
        if choice == "1":
            simulator.run_simulation(duration_minutes=5, interval_seconds=30)
        
        elif choice == "2":
            simulator.test_scenarios()
        
        elif choice == "3":
            pets = list(simulator.pet_profiles.keys())
            current_index = pets.index(simulator.current_pet)
            new_index = (current_index + 1) % len(pets)
            simulator.current_pet = pets[new_index]
            print(f"🐾 Switched to: {simulator.current_pet}")
        
        elif choice == "4":
            print("\nAvailable scenarios:")
            print("- normal: Regular health readings")
            print("- excited: Elevated heart rate and activity")
            print("- sick: Fever, high heart rate, low activity")
            print("- sleeping: Low heart rate and activity")
            
            scenario = input("\nEnter scenario: ").strip().lower()
            if scenario in ["normal", "excited", "sick", "sleeping"]:
                simulator.scenario = scenario
                print(f"🎭 Scenario set to: {scenario}")
                simulator.run_simulation(duration_minutes=2, interval_seconds=15)
            else:
                print("❌ Invalid scenario")
        
        elif choice == "5":
            print("👋 Goodbye!")
            break
        
        else:
            print("❌ Invalid choice")

if __name__ == "__main__":
    main()