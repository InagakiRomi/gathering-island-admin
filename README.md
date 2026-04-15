# Gathering Island Admin

**Gathering Island（聚會島）管理後台** 供 **管理員** 在瀏覽器中維運使用者、聚會活動與標籤。以 **Vue 3 + TypeScript + Vite** 實作，透過 REST API 與後端通訊；一般使用者與公開探索流程由其他客戶端負責，本專案僅涵蓋需 **admin** 角色的後台功能。

[點此進入後台](https://inagakiromi.github.io/gathering-island-admin/)

---

## 產品功能

| 面向           | 說明                                                                                                                           |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| **管理員登入** | 以帳號密碼登入；Access Token 存於前端狀態並以 `Authorization: Bearer` 送出，Refresh Token 可透過與後端約定的 Cookie 機制換發。 |
| **儀表板**     | 彙整聚會數量（依狀態、是否封存等）、使用者與標籤概況，並以圖表呈現活動類型等分布，方便快速掌握營運現況。                       |
| **聚會管理**   | 分頁列表與篩選；檢視單筆詳情、參加者與建立者資訊；支援建立／更新、手動結束、軟刪除封存與恢復等管理員操作。                     |
| **使用者管理** | 分頁列出使用者；檢視單筆並更新顯示名稱、調整角色（含與後端一致的管理員保護規則）。                                             |
| **標籤管理**   | 檢視標籤列表（含引用次數）、建立新標籤、刪除未被使用的標籤，維持分類資料整潔。                                                 |
| **權限與導向** | 未登入導向登入頁；已登入但非管理員導向無權限說明頁；Token 失效時清除狀態並回到登入流程。                                       |

---

## 技術棧

- **Vue 3**、**Vue Router**、**Pinia**：介面、路由與狀態
- **Vite**：建置與開發伺服器
- **TypeScript**
- **Tailwind CSS**、**reka-ui**／自訂元件：版面與可及性友善的 UI
- **TanStack Vue Query**：伺服器狀態與快取
- **TanStack Vue Table**：表格與分頁列表
- **Axios**：HTTP 客戶端（`withCredentials` 搭配後端 Cookie）
- **VeeValidate + Zod**：表單與前端驗證
- **Chart.js**、**vue-chartjs**：儀表板圖表
- **dayjs**：日期時間顯示與處理
- **Vitest**、**Vue Test Utils**：測試

---

## 身分驗證

- 登入成功後將 **Access Token** 置於 Pinia，並由 **Axios 攔截器**自動附加至請求標頭。
- **401** 時清除本地 Token 並導向登入頁，避免以過期身分操作。
- 路由 **meta** 區分需登入與否；後台路由另檢查 JWT 內 **admin** 角色，非管理員導向 `/access-denied`。

---

## 頁面與功能

| 路徑                    | 功能摘要                   |
| ----------------------- | -------------------------- |
| `/login`                | 管理員登入                 |
| `/access-denied`        | 已登入但非管理員時的說明頁 |
| `/admin/dashboard`      | 儀表板：統計卡片與圖表     |
| `/admin/gatherings`     | 聚會列表、篩選與分頁       |
| `/admin/gatherings/:id` | 聚會詳情與管理操作         |
| `/admin/users`          | 使用者列表                 |
| `/admin/users/:id`      | 使用者詳情、名稱與角色     |
| `/admin/tags`           | 標籤列表、建立與刪除       |

實際請求路徑、欄位與錯誤碼請以後端 **Swagger** 為準。

---

## 快速開始

啟動專案：

```bash
npm install
npm run dev
```

建置部署：

```bash
npm run build
```

型別檢查、Lint 與測試：

```bash
npm run type-check
npm run lint
npm run test:run
```

管理員測試帳號與密碼：
```bash
super@test.com
123
```

---

## 介面展示

### 登入介面
<img src="https://github.com/user-attachments/assets/24f43c89-70a9-440d-bf88-7edc8b2b9166" width="840"/>
<img src="https://github.com/user-attachments/assets/f192fad5-1f9c-4f12-aa73-da70a7b8218f" width="840"/>

### 儀板表
<img src="https://github.com/user-attachments/assets/74637de1-ddef-43ad-bf54-397205c9397b" width="840"/>
<img src="https://github.com/user-attachments/assets/af22b9ad-df6e-4258-9b58-68caf4553269" width="840"/>

### 活動介面
<img src="https://github.com/user-attachments/assets/1b823c86-956a-45a3-9d27-c666286cae02" width="840"/>
<img src="https://github.com/user-attachments/assets/6017ac26-bad6-4b3d-a3dd-aaf9fa02492d" width="840"/>

### 使用者介面
<img src="https://github.com/user-attachments/assets/9d049660-ef0c-4fd1-ba1c-433e6363938d" width="840"/>
<img src="https://github.com/user-attachments/assets/9fb807a9-bdb2-42de-8a51-94218d52d351" width="840"/>

### 標籤介面
<img src="https://github.com/user-attachments/assets/de20b3ab-8beb-43cc-8d6d-c713fabd69df" width="840"/>
