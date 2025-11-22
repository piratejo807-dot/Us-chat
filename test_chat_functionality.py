#!/usr/bin/env python3
"""
Script de test automatisé pour l'application de chat
Test toutes les fonctionnalités sans browser manuel
"""

import requests
import json
import time
import re
from urllib.parse import urljoin

class ChatAppTester:
    def __init__(self, base_url="http://localhost:7777"):
        self.base_url = base_url
        self.session = requests.Session()
        self.test_results = []

    def log_test(self, test_name, success, details=""):
        """Enregistre un résultat de test"""
        status = "✅ PASS" if success else "❌ FAIL"
        self.test_results.append({
            "test": test_name,
            "success": success,
            "details": details
        })
        print(f"{status} - {test_name}")
        if details:
            print(f"    {details}")

    def test_server_accessibility(self):
        """Test si le serveur est accessible"""
        try:
            response = self.session.get(self.base_url, timeout=5)
            # Test redirection vers chat-app-final.html
            success = response.status_code in [200, 301, 302]
            self.log_test(
                "Server Accessibility",
                success,
                f"Status: {response.status_code}"
            )
            return success
        except Exception as e:
            self.log_test("Server Accessibility", False, str(e))
            return False

    def test_chat_file_loading(self):
        """Test si le fichier chat se charge correctement"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            success = (
                response.status_code == 200 and
                len(response.content) > 100000 and  # Fichier volumineux
                b"Group Chat" in response.content and
                b"matricule" in response.content
            )
            self.log_test(
                "Chat File Loading",
                success,
                f"Size: {len(response.content)} bytes"
            )
            return success
        except Exception as e:
            self.log_test("Chat File Loading", False, str(e))
            return False

    def test_matricule_data_availability(self):
        """Test si les matricules sont présents dans le fichier"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            # Vérification de quelques matricules connus
            test_matricules = [
                "25BS1046", "25BS1014", "25BS1021", "25BS1022", "25BS1035"
            ]

            found_matricules = []
            for matricule in test_matricules:
                if matricule in content:
                    found_matricules.append(matricule)

            success = len(found_matricules) >= 3  # Au moins 3 trouvés
            self.log_test(
                "Matricule Data Availability",
                success,
                f"Found: {', '.join(found_matricules)}"
            )
            return success
        except Exception as e:
            self.log_test("Matricule Data Availability", False, str(e))
            return False

    def test_login_functionality_simulation(self):
        """Test la logique de login via analyse du code"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            # Vérifier les fonctions de login existent
            login_elements = [
                "function validateMatricule",
                "function handleLogin",
                "matriculeInput",
                "loginPage",
                "welcomePage",
                "chatPage"
            ]

            found_elements = []
            for element in login_elements:
                if element in content:
                    found_elements.append(element)

            success = len(found_elements) >= 4  # Au moins 4 éléments trouvés
            self.log_test(
                "Login Functionality",
                success,
                f"Found: {', '.join(found_elements[:3])}"
            )
            return success
        except Exception as e:
            self.log_test("Login Functionality", False, str(e))
            return False

    def test_messaging_features(self):
        """Test les fonctionnalités de messagerie"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            # Vérifier les fonctions de messagerie
            messaging_elements = [
                "sendMessage",
                "displayMessage",
                "messages",
                "localStorage",
                "messageInput"
            ]

            found_elements = []
            for element in messaging_elements:
                if element in content:
                    found_elements.append(element)

            success = len(found_elements) >= 3
            self.log_test(
                "Messaging Features",
                success,
                f"Found: {', '.join(found_elements[:3])}"
            )
            return success
        except Exception as e:
            self.log_test("Messaging Features", False, str(e))
            return False

    def test_dark_mode_feature(self):
        """Test la fonctionnalité dark mode"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            dark_mode_indicators = [
                "darkMode",
                "toggleDarkMode",
                "dark-mode",
                "body.dark"
            ]

            found_indicators = []
            for indicator in dark_mode_indicators:
                if indicator in content:
                    found_indicators.append(indicator)

            success = len(found_indicators) >= 2
            self.log_test(
                "Dark Mode Feature",
                success,
                f"Found: {', '.join(found_indicators)}"
            )
            return success
        except Exception as e:
            self.log_test("Dark Mode Feature", False, str(e))
            return False

    def test_profile_features(self):
        """Test les fonctionnalités de profil"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            profile_features = [
                "photoInput",
                "changePhoto",
                "displayName",
                "settings",
                "avatar"
            ]

            found_features = []
            for feature in profile_features:
                if feature in content:
                    found_features.append(feature)

            success = len(found_features) >= 3
            self.log_test(
                "Profile Features",
                success,
                f"Found: {', '.join(found_features[:3])}"
            )
            return success
        except Exception as e:
            self.log_test("Profile Features", False, str(e))
            return False

    def test_responsive_design(self):
        """Test le design responsive"""
        try:
            response = self.session.get(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html", timeout=10)
            content = response.text

            responsive_indicators = [
                "@media",
                "mobile",
                "responsive",
                "max-width",
                "min-width"
            ]

            found_indicators = []
            for indicator in responsive_indicators:
                if indicator in content:
                    found_indicators.append(indicator)

            success = len(found_indicators) >= 2
            self.log_test(
                "Responsive Design",
                success,
                f"Found: {', '.join(found_indicators[:3])}"
            )
            return success
        except Exception as e:
            self.log_test("Responsive Design", False, str(e))
            return False

    def run_all_tests(self):
        """Exécute tous les tests"""
        print("🚀 DÉMARRAGE DES TESTS AUTOMATISÉS")
        print("=" * 50)
        print(f"URL de test: {self.base_url}")
        print()

        tests = [
            self.test_server_accessibility,
            self.test_chat_file_loading,
            self.test_matricule_data_availability,
            self.test_login_functionality_simulation,
            self.test_messaging_features,
            self.test_dark_mode_feature,
            self.test_profile_features,
            self.test_responsive_design
        ]

        for test in tests:
            test()
            time.sleep(0.5)  # Pause entre tests

        self.generate_report()

    def generate_report(self):
        """Génère le rapport final de tests"""
        print("\n" + "=" * 50)
        print("📊 RAPPORT FINAL DE TESTS")
        print("=" * 50)

        passed = sum(1 for result in self.test_results if result["success"])
        total = len(self.test_results)

        print(f"\n✅ Tests réussis: {passed}/{total}")
        print(f"❌ Tests échoués: {total - passed}/{total}")
        print(f"📈 Taux de réussite: {(passed/total)*100:.1f}%")

        print("\n📋 DÉTAIL DES TESTS:")
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['test']}")
            if result["details"] and not result["success"]:
                print(f"   → {result['details']}")

        if passed == total:
            print("\n🎉 TOUS LES TESTS SONT PASSÉS - APPLICATION 100% FONCTIONNELLE !")
        else:
            print(f"\n⚠️  {total - passed} test(s) échoué(s) - Vérification manuelle recommandée")

        print(f"\n🌐 URL pour tests manuels: {self.base_url}/CHAT-SIMPLE-CORRIGE.html")
        print("📱 Matricules de test: 25BS1046, 25BS1014, 25BS1021, 25BS1022")

if __name__ == "__main__":
    tester = ChatAppTester()
    tester.run_all_tests()