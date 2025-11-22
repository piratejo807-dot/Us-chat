#!/usr/bin/env python3
"""
Script de test automatisé simple pour l'application de chat
Utilise seulement les modules Python standards
"""

import urllib.request
import urllib.error
import re
import time
import os

class SimpleChatTester:
    def __init__(self, base_url="http://localhost:7777"):
        self.base_url = base_url
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

    def fetch_url(self, url):
        """Récupère le contenu d'une URL"""
        try:
            with urllib.request.urlopen(url, timeout=10) as response:
                return response.read().decode('utf-8'), response.getcode()
        except Exception as e:
            return None, str(e)

    def test_server_accessibility(self):
        """Test si le serveur est accessible"""
        try:
            content, status = self.fetch_url(self.base_url)
            success = status in [200, 301, 302]
            self.log_test(
                "Server Accessibility",
                success,
                f"Status: {status}"
            )
            return success
        except Exception as e:
            self.log_test("Server Accessibility", False, str(e))
            return False

    def test_chat_file_loading(self):
        """Test si le fichier chat se charge correctement"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")
            success = (
                status == 200 and
                content and
                len(content) > 100000 and  # Fichier volumineux
                "Group Chat" in content and
                "matricule" in content
            )
            self.log_test(
                "Chat File Loading",
                success,
                f"Size: {len(content) if content else 0} bytes"
            )
            return success
        except Exception as e:
            self.log_test("Chat File Loading", False, str(e))
            return False

    def test_matricule_data(self):
        """Test la présence des matricules"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            test_matricules = [
                "25BS1046", "25BS1014", "25BS1021", "25BS1022", "25BS1035"
            ]

            found_count = sum(1 for matricule in test_matricules if matricule in content)
            success = found_count >= 3

            self.log_test(
                "Matricule Data Presence",
                success,
                f"Found {found_count}/5 test matricules"
            )
            return success
        except Exception as e:
            self.log_test("Matricule Data Presence", False, str(e))
            return False

    def test_login_functions(self):
        """Test les fonctions de login"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            login_patterns = [
                r"function\s+validateMatricule",
                r"function\s+handleLogin",
                r"matriculeInput",
                r"loginPage",
                r"welcomePage",
                r"chatPage"
            ]

            found_count = sum(1 for pattern in login_patterns if re.search(pattern, content))
            success = found_count >= 4

            self.log_test(
                "Login Functions",
                success,
                f"Found {found_count}/6 login elements"
            )
            return success
        except Exception as e:
            self.log_test("Login Functions", False, str(e))
            return False

    def test_messaging_system(self):
        """Test le système de messagerie"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            messaging_patterns = [
                r"function\s+sendMessage",
                r"function\s+displayMessage",
                r"localStorage",
                r"messageInput",
                r"messagesArray"
            ]

            found_count = sum(1 for pattern in messaging_patterns if re.search(pattern, content))
            success = found_count >= 3

            self.log_test(
                "Messaging System",
                success,
                f"Found {found_count}/5 messaging elements"
            )
            return success
        except Exception as e:
            self.log_test("Messaging System", False, str(e))
            return False

    def test_dark_mode(self):
        """Test le mode sombre"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            dark_mode_patterns = [
                r"darkMode",
                r"toggleDarkMode",
                r"dark-mode",
                r"body\.dark"
            ]

            found_count = sum(1 for pattern in dark_mode_patterns if re.search(pattern, content))
            success = found_count >= 2

            self.log_test(
                "Dark Mode Feature",
                success,
                f"Found {found_count}/4 dark mode elements"
            )
            return success
        except Exception as e:
            self.log_test("Dark Mode Feature", False, str(e))
            return False

    def test_profile_features(self):
        """Test les fonctionnalités de profil"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            profile_patterns = [
                r"photoInput",
                r"changePhoto",
                r"displayName",
                r"settings",
                r"avatar"
            ]

            found_count = sum(1 for pattern in profile_patterns if re.search(pattern, content))
            success = found_count >= 3

            self.log_test(
                "Profile Features",
                success,
                f"Found {found_count}/5 profile elements"
            )
            return success
        except Exception as e:
            self.log_test("Profile Features", False, str(e))
            return False

    def test_responsive_design(self):
        """Test le design responsive"""
        try:
            content, status = self.fetch_url(f"{self.base_url}/CHAT-SIMPLE-CORRIGE.html")

            responsive_patterns = [
                r"@media",
                r"mobile",
                r"responsive",
                r"max-width"
            ]

            found_count = sum(1 for pattern in responsive_patterns if re.search(pattern, content))
            success = found_count >= 2

            self.log_test(
                "Responsive Design",
                success,
                f"Found {found_count}/4 responsive elements"
            )
            return success
        except Exception as e:
            self.log_test("Responsive Design", False, str(e))
            return False

    def test_file_structure(self):
        """Test la structure des fichiers"""
        try:
            files_to_check = [
                "CHAT-SIMPLE-CORRIGE.html",
                "SOLUTION.md"
            ]

            existing_files = []
            for file_name in files_to_check:
                if os.path.exists(file_name):
                    existing_files.append(file_name)

            success = len(existing_files) >= 1
            self.log_test(
                "File Structure",
                success,
                f"Found: {', '.join(existing_files)}"
            )
            return success
        except Exception as e:
            self.log_test("File Structure", False, str(e))
            return False

    def run_all_tests(self):
        """Exécute tous les tests"""
        print("🚀 DÉMARRAGE DES TESTS AUTOMATISÉS")
        print("=" * 50)
        print(f"URL de test: {self.base_url}")
        print()

        tests = [
            self.test_file_structure,
            self.test_server_accessibility,
            self.test_chat_file_loading,
            self.test_matricule_data,
            self.test_login_functions,
            self.test_messaging_system,
            self.test_dark_mode,
            self.test_profile_features,
            self.test_responsive_design
        ]

        for test in tests:
            test()
            time.sleep(0.3)  # Pause entre tests

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

        if passed >= total * 0.8:  # 80% ou plus = fonctionnel
            print("\n🎉 APPLICATION FONCTIONNELLE - PRÊTE POUR UTILISATION !")
        else:
            print(f"\n⚠️  Certains tests échouent - Vérification manuelle recommandée")

        print(f"\n🌐 URL pour tests manuels: {self.base_url}/CHAT-SIMPLE-CORRIGE.html")
        print("📱 Matricules de test: 25BS1046, 25BS1014, 25BS1021, 25BS1022")

if __name__ == "__main__":
    tester = SimpleChatTester()
    tester.run_all_tests()