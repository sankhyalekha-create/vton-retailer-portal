import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { listProducts, uploadProduct, deleteProduct } from '@/api/client'
import { useAuth } from '@/contexts/AuthContext'

interface Product {
  id: string
  name: string
  category: string
  primary_image_url: string
  is_active: boolean
  tags: string[]
  created_at: string
}

export default function ProductsPage() {
  const { token } = useAuth()
  const qc = useQueryClient()
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [category, setCategory] = useState('')
  const [file, setFile] = useState<File | null>(null)

  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['products'],
    queryFn: () => listProducts(token!) as Promise<Product[]>,
    enabled: !!token,
  })

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/*': [] },
    maxFiles: 1,
    onDrop: (files) => setFile(files[0] ?? null),
  })

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error('No file selected')
      const form = new FormData()
      form.append('name', name)
      form.append('category', category)
      form.append('image', file)
      return uploadProduct(token!, form)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] })
      toast.success('Product uploaded')
      setShowForm(false)
      setName(''); setCategory(''); setFile(null)
    },
    onError: (e: Error) => toast.error(e.message),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProduct(token!, id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['products'] }); toast.success('Product deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800"
        >
          {showForm ? 'Cancel' : '+ Upload Product'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
            </div>
          </div>
          <div {...getRootProps()} className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center cursor-pointer hover:border-gray-400 transition-colors">
            <input {...getInputProps()} />
            {file ? <p className="text-sm text-green-600">{file.name}</p> : <p className="text-sm text-gray-500">Drop garment image here, or click to select</p>}
          </div>
          <button
            onClick={() => uploadMutation.mutate()}
            disabled={!name || !category || !file || uploadMutation.isPending}
            className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-gray-800"
          >
            {uploadMutation.isPending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      )}

      {isLoading ? (
        <p className="text-gray-400">Loading products…</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <img src={p.primary_image_url} alt={p.name} className="w-full aspect-[3/4] object-cover" />
              <div className="p-3">
                <p className="font-medium text-gray-900 text-sm truncate">{p.name}</p>
                <p className="text-gray-500 text-xs">{p.category}</p>
                <button
                  onClick={() => { if (confirm('Delete this product?')) deleteMutation.mutate(p.id) }}
                  className="mt-2 text-xs text-red-500 hover:text-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
