import React, { useState } from 'react';
import styles from "./Payment.module.css";

export default function Payment() {
  const [paymentMethod, setPaymentMethod] = useState("online"); // الحالة الافتراضية: الدفع أونلاين

  // قائمة الدول (يمكن استبدالها بقائمة كاملة من API أو ملف JSON)
  const countries = [
    "Afghanistan",
    "Albania",
    "Algeria",
    "Andorra",
    "Angola",
    "Antigua and Barbuda",
    "Argentina",
    "Armenia",
    "Australia",
    "Austria",
    "Azerbaijan",
    "Bahamas",
    "Bahrain",
    "Bangladesh",
    "Barbados",
    "Belarus",
    "Belgium",
    "Belize",
    "Benin",
    "Bhutan",
    "Bolivia",
    "Bosnia and Herzegovina",
    "Botswana",
    "Brazil",
    "Brunei",
    "Bulgaria",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cambodia",
    "Cameroon",
    "Canada",
    "Central African Republic",
    "Chad",
    "Chile",
    "China",
    "Colombia",
    "Comoros",
    "Congo (Congo-Brazzaville)",
    "Costa Rica",
    "Croatia",
    "Cuba",
    "Cyprus",
    "Czechia (Czech Republic)",
    "Denmark",
    "Djibouti",
    "Dominica",
    "Dominican Republic",
    "East Timor (Timor-Leste)",
    "Ecuador",
    "Egypt",
    "El Salvador",
    "Equatorial Guinea",
    "Eritrea",
    "Estonia",
    "Eswatini (fmr. Swaziland)",
    "Ethiopia",
    "Fiji",
    "Finland",
    "France",
    "Gabon",
    "Gambia",
    "Georgia",
    "Germany",
    "Ghana",
    "Greece",
    "Grenada",
    "Guatemala",
    "Guinea",
    "Guinea-Bissau",
    "Guyana",
    "Haiti",
    "Honduras",
    "Hungary",
    "Iceland",
    "India",
    "Indonesia",
    "Iran",
    "Iraq",
    "Ireland",
    "Israel",
    "Italy",
    "Jamaica",
    "Japan",
    "Jordan",
    "Kazakhstan",
    "Kenya",
    "Kiribati",
    "Korea, North",
    "Korea, South",
    "Kosovo",
    "Kuwait",
    "Kyrgyzstan",
    "Laos",
    "Latvia",
    "Lebanon",
    "Lesotho",
    "Liberia",
    "Libya",
    "Liechtenstein",
    "Lithuania",
    "Luxembourg",
    "Madagascar",
    "Malawi",
    "Malaysia",
    "Maldives",
    "Mali",
    "Malta",
    "Marshall Islands",
    "Mauritania",
    "Mauritius",
    "Mexico",
    "Micronesia",
    "Moldova",
    "Monaco",
    "Mongolia",
    "Montenegro",
    "Morocco",
    "Mozambique",
    "Myanmar (formerly Burma)",
    "Namibia",
    "Nauru",
    "Nepal",
    "Netherlands",
    "New Zealand",
    "Nicaragua",
    "Niger",
    "Nigeria",
    "North Macedonia",
    "Norway",
    "Oman",
    "Pakistan",
    "Palau",
    "Palestine State",
    "Panama",
    "Papua New Guinea",
    "Paraguay",
    "Peru",
    "Philippines",
    "Poland",
    "Portugal",
    "Qatar",
    "Romania",
    "Russia",
    "Rwanda",
    "Saint Kitts and Nevis",
    "Saint Lucia",
    "Saint Vincent and the Grenadines",
    "Samoa",
    "San Marino",
    "Sao Tome and Principe",
    "Saudi Arabia",
    "Senegal",
    "Serbia",
    "Seychelles",
    "Sierra Leone",
    "Singapore",
    "Slovakia",
    "Slovenia",
    "Solomon Islands",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Spain",
    "Sri Lanka",
    "Sudan",
    "Suriname",
    "Sweden",
    "Switzerland",
    "Syria",
    "Taiwan",
    "Tajikistan",
    "Tanzania",
    "Thailand",
    "Togo",
    "Tonga",
    "Trinidad and Tobago",
    "Tunisia",
    "Turkey",
    "Turkmenistan",
    "Tuvalu",
    "Uganda",
    "Ukraine",
    "United Arab Emirates",
    "United Kingdom",
    "United States of America",
    "Uruguay",
    "Uzbekistan",
    "Vanuatu",
    "Vatican City",
    "Venezuela",
    "Vietnam",
    "Yemen",
    "Zambia",
    "Zimbabwe"
  ];

  return (
    <div className="min-h-screen flex justify-center p-1 mt-32">
      {/* قسم المبلغ الإجمالي على اليسار */}
      <div className="flex-1 flex justify-center">
        <div className="mb-6 text-center">
          <h1 className="text-2xl mb-6 text-center text-gray-500">Reem Amr</h1>
          <p className="text-4xl font-bold text-gray-800 mt-12">EGP 1,495.00</p>
        </div>
      </div>

      {/* قسم تفاصيل الدفع على اليمين */}
      <div className="flex-1 flex items-center justify-center">
        <div className="bg-white px-8 py-6 rounded-lg shadow-lg w-full max-w-md">
          {/* خيارات الدفع: أونلاين أو كاش */}
          <div className="mb-6">
            <div className="flex space-x-4">
              <button
                onClick={() => setPaymentMethod("online")}
                className={`flex-1 py-2 rounded-md ${
                  paymentMethod === "online"
                    ? "bg-[#a67c52] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Pay Online
              </button>
              <button
                onClick={() => setPaymentMethod("cash")}
                className={`flex-1 py-2 rounded-md ${
                  paymentMethod === "cash"
                    ? "bg-[#a67c52] text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Pay Cash
              </button>
            </div>
          </div>

          {/* تفاصيل الدفع بناءً على الاختيار */}
          {paymentMethod === "online" ? (
            <>
              {/* تفاصيل الدفع أونلاين */}
              <div className="mb-6">
                <a href="#" className="text-lg font-semibold mb-2">
                  Pay with link
                </a>
                <p className="text-sm text-gray-600 mb-4">- Or pay with card</p>
              </div>

              <div className="mb-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Information
                  </label>
                  <input
                    type="text"
                    placeholder="1234 1234 1234 1234"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    className="w-1/4 mt-2 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cardholder name
                  </label>
                  <input
                    type="text"
                    placeholder="Full name on card"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country or region
                  </label>
                  <select
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    defaultValue="Egypt"
                  >
                    {countries.map((country, index) => (
                      <option key={index} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* خيار حفظ المعلومات */}
              <div className="mb-6">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Securely save my information for t-click checkout
                  </span>
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Pay faster on Route E-Commerce App and everywhere Link is accepted.
                </p>
              </div>

              {/* زر الدفع */}
              <button className="w-full bg-[#a67c52] text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                Pay Online
              </button>
            </>
          ) : (
            <>
              {/* تفاصيل الدفع كاش */}
              <div className="mb-6">
                <p className="text-lg font-semibold mb-2">
                  Pay with Cash
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Please prepare the exact amount for delivery.
                </p>
              </div>

              {/* زر تأكيد الدفع كاش */}
              <button className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                Confirm Cash Payment
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}