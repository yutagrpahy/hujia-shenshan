# 儲存點說明

## 調整前版本（可恢復）

| 項目 | 內容 |
|------|------|
| Git tag | `savepoint-pre-mobile-ux` |
| Git commit | `65a27ea` — `savepoint: before mobile typography and full-width layout (v0.5.0)` |
| 說明 | 手機字級優化（14px 最小字級）與全寬版面修正**之前**的版本 |

### 恢復方式

在專案根目錄執行：

```bash
cd /Users/chungyuta/legacymap
git log --oneline -3          # 確認儲存點 commit
git checkout savepoint-pre-mobile-ux -- .   # 還原所有檔案至儲存點
# 或切換至儲存點分支：
git checkout -b restore-pre-mobile-ux savepoint-pre-mobile-ux
```

若僅想比對差異：

```bash
git diff <儲存點-commit> HEAD
```