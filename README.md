<p align="center">
  <img src="wloc.jpg" width="144" />
</p>

<p align="center">
  <a href="README.md"><b>繁體中文</b></a> ·
  <a href="README.en.md">English</a>
</p>

# Apple WLOC 定位修改

修改 Apple 網路定位服務 (WiFi/基地台) 回傳的座標，實現 iOS 網路定位虛擬定位。打開線上選點頁面選位置即可生效，無需手動填經緯度。

---

## 訂閱網址

**Surge:**
https://raw.githubusercontent.com/cyberhandyman/wloc-spoofer-en/refs/heads/main/modules/wloc.sgmodule

**Quantumult X:**
https://raw.githubusercontent.com/cyberhandyman/wloc-spoofer-en/refs/heads/main/modules/wloc.conf

**Loon:**
https://raw.githubusercontent.com/cyberhandyman/wloc-spoofer-en/refs/heads/main/modules/wloc.lpx

**Stash:**
https://raw.githubusercontent.com/cyberhandyman/wloc-spoofer-en/refs/heads/main/modules/wloc.stoverride

**Shadowrocket(小火箭):**
https://raw.githubusercontent.com/cyberhandyman/wloc-spoofer-en/refs/heads/main/modules/wloc.module

> Egern 可直接使用 Surge 模組
> Stash 請直接訂閱上面的 `.stoverride`，無需用 Script Hub 轉換

---

## 捷徑（推薦，最方便）

直接用捷徑切換／清除定位，無需打開選點頁面：

- **wloc Set Location**：https://www.icloud.com/shortcuts/182f3a014597468eb1b15b99261cdf22
- **wloc Clear & Restore Location**：https://www.icloud.com/shortcuts/0352d53ed79849d382f50e9adf050662

**用法**

- **設定位置：** 在地圖 App 裡選好位置（長按地圖選點）→ 共享 → 選「wloc Set Location」即可切換。
  - Apple 地圖：選點 → 共享 → 「wloc Set Location」
  - 高德地圖：選點 → 分享 → **更多** → 「wloc Set Location」
- **清除位置：** 點「wloc Clear & Restore Location」即可恢復真實定位。

支援 Apple 地圖、高德（含短連結，自動跟隨跳轉 + GCJ-02→WGS84 座標換算）。

> 前提：代理已開啟 + 模組已啟用 + 信任 `gs-loc.apple.com`。選點頁面（Worker / Pages）方案仍保留，見下方。

---

### 關於地圖連結解析（worker）

為了讓 Apple 地圖和高德走同一條流程，連結統一發送到 `wloc-spoofer.cyberhandyman.workers.dev/api/parse` 解析：

- **高德**：分享出來是短連結，真實座標只藏在 302 跳轉的 `Location` 標頭裡，且是 GCJ-02 偏移座標。捷徑既讀不到跳轉標頭、也難以做座標換算，所以由 worker 跟隨跳轉 → 抓取座標 → GCJ-02→WGS84 → 回傳經緯度。
- **Apple 地圖**：連結裡直接帶 `coordinate=緯度,經度`，但在**中國大陸同樣是 GCJ-02 偏移座標**，所以和高德一樣由 worker 做 GCJ-02→WGS84 換算後回傳；境外座標會自動跳過換算（`out_of_china` 判斷）原樣回傳。除了統一座標系，走同一介面也方便統一處理短連結、文字夾帶連結、名稱解碼等。

**隱私：** `/api/parse` 是純轉發解析——收到連結 → 跟隨跳轉 → 解析座標 → 回傳 JSON，全程不寫入任何儲存、不記錄日誌、不快取，處理完即丟棄。

**不放心可自行部署：** worker 原始碼完全開源，可自行部署一份取代上面的網址：

- 解析邏輯：[`worker/src/parse.js`](worker/src/parse.js)，路由：[`worker/src/index.js`](worker/src/index.js)
- 部署後把捷徑裡的 `wloc-spoofer.cyberhandyman.workers.dev` 換成你自己的 worker 網域即可。

---

<details>
<summary><b>使用方法</b></summary>

1. 訂閱模組並啟用 MITM
2. 打開線上選點頁面（公共 Worker，建議加入主畫面）
3. 地圖選位置／搜尋地名／貼上地圖連結
4. 點擊「儲存到裝置」
5. 下次 Apple 定位觸發時自動生效

支援 Apple Maps / Google Maps / 高德 / 百度 / 座標文字 連結解析。

> **iOS 26/27 及更高版本注意：** Apple 從 iOS 26 開始大幅強化了 `locationd` 的定位快取機制，系統會將先前取得的真實定位結果快取在記憶體中並長時間重複使用。這代表安裝模組或切換目標座標後，即使腳本已成功修改了 WLOC 回應（日誌顯示「已修改」），系統仍可能繼續使用快取中的舊座標，導致定位看起來沒有變化。
>
> **解決方法：重新啟動裝置。** 重新啟動會清空 `locationd` 的記憶體快取，系統重新發出 WLOC 請求時會取得修改後的座標。飛航模式開關、關閉定位服務等方式在 iOS 26+ 上**無法**清除此快取，必須重新啟動。iOS 15～18 通常不需要重新啟動即可生效。

**高版本系統建議操作流程（成功率最高）：**

方法一：
1. 先在選點頁面選好需要修改的定位並儲存到裝置
2. 開啟飛航模式 → 關閉定位服務 → 重新啟動裝置
3. 關閉飛航模式（WiFi 也要關）→ 連接代理工具（確認 VPN 圖示出現）→ 打開定位服務
4. 打開地圖驗證

方法二：
1. 關閉定位服務
2. 在選點頁面選好位置並儲存到裝置
3. 打開定位服務 → 彈出「允許存取位置資訊」時選擇**「下次詢問或在我共享時」**
4. 打開地圖驗證

</details>

<details>
<summary><b>運作原理</b></summary>

```
選點頁面 → fetch gs-loc.apple.com/wloc-settings/save?lon=x&lat=y
         → 代理模組攔截 → wloc-settings.js 寫入 $persistentStore
         → 下次 WLOC 觸發 → wloc.js 讀取座標 → patch protobuf 回應
```

模組包含兩條規則：
- `wloc.js` — 攔截 `/clls/wloc` 回應，解析 protobuf 並替換座標
- `wloc-settings.js` — 攔截 `/wloc-settings/save` 請求，寫入持久化儲存

</details>

<details>
<summary><b>參數設定</b></summary>

| 參數 | 說明 | 預設值 |
|------|------|--------|
| longitude | 目標經度（線上選點優先） | null（透傳） |
| latitude | 目標緯度（線上選點優先） | null（透傳） |
| accuracy | 精度（公尺） | 25 |
| logLevel | 日誌等級 | info |

優先順序：線上選點儲存 > 模組參數 > 預設值

</details>

<details>
<summary><b>取消虛擬定位／恢復真實定位</b></summary>

**方法一：關閉或刪除模組**（推薦）

關閉模組後腳本不再攔截 WLOC 請求，系統自動恢復真實定位。iOS 26+ 需要重新啟動裝置以清除定位快取。

**方法二：清除持久化資料（透傳模式）**

清除已儲存的座標後，腳本進入**透傳模式**——不修改 WLOC 回應，直接放行原始資料，系統自動恢復真實 GPS 定位。

**透傳模式觸發條件：** 持久化資料為空（null）且模組參數為預設值（113.94114, 22.544577）時，腳本判定使用者未自訂座標，自動跳過修改。模組預設參數無需更改，僅清除持久化資料即可觸發透傳。

在代理工具中刪除持久化資料，欄位名稱為 `wloc_settings`：

- **Surge** — 於腳本編輯器執行: `$persistentStore.write(null, "wloc_settings")`
- **Quantumult X** — 執行: `$prefs.removeValueForKey("wloc_settings")`
- **Loon** — 執行: `$persistentStore.write(null, "wloc_settings")`

清除後重新啟動裝置即可恢復真實定位。無需關閉模組，腳本會自動偵測到無自訂座標並跳過修改。

> **注意：** 如果使用者在模組參數中手動修改了經緯度（非預設 113.94114, 22.544577），即使清除持久化資料，腳本仍會使用模組參數中的座標進行修改。只有保持預設參數不變時，清除持久化資料才會進入透傳模式。

</details>

<details>
<summary><b>收藏位置功能</b></summary>

線上選點頁面支援收藏多個位置，方便來回切換：

- **新增收藏**：選好位置後點擊「收藏位置」→ 輸入備註名稱（支援中文／英文／數字，最多 30 字）→ 儲存
- **快速切換**：點擊收藏列表中的位置 → 地圖自動跳轉 → 點「儲存到裝置」即可切換
- **目前生效標記**：與裝置已儲存座標一致的收藏會顯示「✓ 目前生效」
- **刪除管理**：單筆刪除（× 按鈕）或清空全部
- **目前生效座標**：頁面顯示裝置端持久化資料（wloc_settings），支援重新整理查詢和清除

**資料儲存說明：**
- **收藏列表** → 儲存在瀏覽器 `localStorage`（僅用於選點頁面的 UI 便捷操作）
- **生效座標** → 儲存在代理工具持久化儲存 `$persistentStore`（腳本執行時實際讀取的資料）

兩者獨立儲存。收藏列表是瀏覽器端的輔助資料，清除瀏覽器快取或更換瀏覽器後需重新收藏，但不影響已儲存到裝置的生效座標。

</details>

<details>
<summary><b>自行部署 Worker（推薦）</b></summary>

公共選點頁面有請求上限，建議部署自己的實例：

- **Workers**: `https://wloc-spoofer.cyberhandyman.workers.dev/`
- **Pages**: `https://<專案名稱>.pages.dev/`

**一鍵部署（Workers）：**

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/cyberhandyman/wloc-spoofer-en/tree/main/worker)

> 一鍵部署僅支援 Workers 模式，點擊按鈕後依提示授權即可完成部署。

**手動部署（Workers）：**

```bash
# 1. 複製儲存庫
git clone https://github.com/cyberhandyman/wloc-spoofer-en.git
cd wloc-spoofer-en/worker

# 2. 安裝依賴套件
npm install

# 3. 登入 Cloudflare（首次需要）
npx wrangler login

# 4. 部署
npm run deploy
```

部署成功後會取得你自己的 Worker 網址（如 `https://wloc-spoofer.<你的子網域>.workers.dev`），用這個網址選點即可。

> 免費帳戶每天 10 萬次請求，個人使用完全足夠。

<details>
<summary>進階：Pages 部署</summary>

Pages 部署不支援一鍵按鈕，需要手動執行：

```bash
git clone https://github.com/cyberhandyman/wloc-spoofer-en.git
cd wloc-spoofer-en/worker
npm install
npx wrangler pages deploy dist --project-name <自訂專案名稱>
```

部署時會提示設定 production branch，輸入 `main` 即可。部署成功後取得 `https://<專案名稱>.pages.dev` 網址。

Pages 和 Workers 功能完全一致，按需選擇即可。

</details>

</details>

<details>
<summary><b>注意事項</b></summary>

- 需要 MITM 憑證信任 `gs-loc.apple.com` 和 `gs-loc-cn.apple.com`
- 僅修改網路定位（WiFi／基地台），不影響 GPS 硬體定位
- iOS 在 GPS 訊號強時可能忽略網路定位結果
- 適用於以 WiFi 定位為主的室內場景效果最佳
- 選點頁面需在代理模式下使用（Safari 走代理才能攔截儲存請求）

</details>

---

## 致謝

- [proxypin-wloc-spoofer](https://github.com/FFF686868/proxypin-wloc-spoofer) - 原始 WLOC 定位修改思路 by FFF686868
- [NSNanoCat/Util](https://github.com/NSNanoCat/util) - 跨平台腳本工具框架