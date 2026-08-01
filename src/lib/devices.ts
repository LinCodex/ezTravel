export interface DeviceGroup {
  brand: string;
  devices: string[];
}

// Common eSIM-capable devices. Regional exceptions (notably mainland-China
// models) are called out on the compatibility page.
export const esimDevices: DeviceGroup[] = [
  {
    brand: "Apple",
    devices: [
      "iPhone 17 / 17 Pro / 17 Pro Max",
      "iPhone 16 / 16 Plus / 16 Pro / 16 Pro Max / 16e",
      "iPhone 15 / 15 Plus / 15 Pro / 15 Pro Max",
      "iPhone 14 / 14 Plus / 14 Pro / 14 Pro Max",
      "iPhone 13 / 13 mini / 13 Pro / 13 Pro Max",
      "iPhone 12 / 12 mini / 12 Pro / 12 Pro Max",
      "iPhone 11 / 11 Pro / 11 Pro Max",
      "iPhone XS / XS Max / XR",
      "iPhone SE (2020 & 2022)",
      "iPad Pro, iPad Air, iPad mini (cellular models, 2019+)",
    ],
  },
  {
    brand: "Samsung",
    devices: [
      "Galaxy S25 / S25+ / S25 Ultra",
      "Galaxy S24 / S24+ / S24 Ultra / S24 FE",
      "Galaxy S23 / S23+ / S23 Ultra / S23 FE",
      "Galaxy S22 / S22+ / S22 Ultra",
      "Galaxy S21 / S21+ / S21 Ultra (5G)",
      "Galaxy S20 / S20+ / S20 Ultra",
      "Galaxy Z Fold 2 / 3 / 4 / 5 / 6",
      "Galaxy Z Flip / 3 / 4 / 5 / 6",
      "Galaxy Note 20 / Note 20 Ultra",
      "Galaxy A54 / A55 (select regions)",
    ],
  },
  {
    brand: "Google",
    devices: [
      "Pixel 10 / 10 Pro",
      "Pixel 9 / 9 Pro / 9 Pro XL / 9a",
      "Pixel 8 / 8 Pro / 8a",
      "Pixel 7 / 7 Pro / 7a",
      "Pixel 6 / 6 Pro / 6a",
      "Pixel 5 / 5a",
      "Pixel 4 / 4 XL / 4a",
      "Pixel 3 / 3 XL / 3a / 3a XL",
      "Pixel Fold",
    ],
  },
  {
    brand: "Other brands",
    devices: [
      "Motorola Razr / Razr+ (2019+)",
      "Motorola Edge (2022+)",
      "OnePlus 11 / 12 / 13 (select regions)",
      "Xiaomi 13 / 14 / 15 (global models)",
      "Oppo Find X3 / X5 / X8 Pro",
      "Sony Xperia 1 IV / 1 V / 10 IV",
      "Huawei P40 / P40 Pro / Mate 40 Pro",
      "Nothing Phone (2a) and newer",
      "Fairphone 4 / 5",
    ],
  },
];
