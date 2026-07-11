import { Button } from '@heroui/react'
import { Eye, FileText, Lock, Plus } from 'lucide-react'
import type { SecureDocument } from '../../types'

const DOC_TYPE_LABELS: Record<string, string> = {
  will: '遺囑',
  trust: '信託',
  medical: '醫療指示',
  contract: '重要合約',
  policy: '保單',
}

interface DocumentVaultProps {
  documents: SecureDocument[]
  canUpload: boolean
}

export function DocumentVault({
  documents,
  canUpload,
}: DocumentVaultProps) {
  return (
    <div className="m3-card p-4">
      {documents.length === 0 ? (
        <p className="text-sm text-gray-400 py-4 text-center">尚無上傳文件</p>
      ) : (
        <div className="ds-stack-tight">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="m3-list-item flex items-center gap-3 py-2.5 px-2 hover:bg-warm-50 transition-colors"
            >
              <div className="m3-icon-wrap m3-icon-wrap--lg shrink-0">
                <FileText className="w-4 h-4 text-teal-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{doc.name}</p>
                <p className="text-[10px] text-gray-400">
                  {DOC_TYPE_LABELS[doc.type]} · {doc.uploadedAt}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!canUpload && (
                  <span className="m3-chip m3-chip--muted flex items-center gap-0.5">
                    <Eye className="w-3 h-3" />
                    僅供瀏覽
                  </span>
                )}
                {doc.encrypted && <Lock className="w-3.5 h-3.5 text-teal-500" />}
              </div>
            </div>
          ))}
        </div>
      )}

      {canUpload ? (
        <Button className="btn-accent mt-3 w-full" size="sm">
          <Plus className="w-4 h-4" />
          上傳文件
        </Button>
      ) : (
        <p className="text-[10px] text-gray-400 mt-3 text-center">
          此為他人上傳的文件，您僅能瀏覽
        </p>
      )}
    </div>
  )
}