"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getWareHouseId } from "@/hooks/get-werehouseId"
import { useSession } from "next-auth/react"

export default function PurchasePage(){
    const router = useRouter()
    const warehouseId = getWareHouseId()
    const { data: session } = useSession()

    useEffect(() => {
        if (warehouseId && session?.user?.role) {
            router.push(`/warehouse/${warehouseId}/${session.user.role}/dashboard`)
        }
    }, [warehouseId, session, router])

    return (
        <div className="flex items-center justify-center h-64">
            <span>Redirecting to dashboard...</span>
        </div>
    )
}