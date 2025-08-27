import { NextRequest, NextResponse } from "next/server";
import offlinePrisma from "@/lib/oflinePrisma";

export async function POST(req: NextRequest) {
    const {
        quotationNo,
        paymentMethods,
        amountPaid,
        balance,
        invoiceNo
    } = await req.json()

    try {
        // Get the quotation with items
        const quotation = await offlinePrisma.quotation.findUnique({
            where: { quotationNo, isDeleted: false },
            include: {
                quotationItems: {
                    where: { isDeleted: false },
                    include: { product: true }
                },
                selectedCustomer: true
            }
        })

        if (!quotation) {
            return NextResponse.json("Quotation not found", { status: 404 })
        }

        if (quotation.status === "converted") {
            return NextResponse.json("Quotation already converted to sale", { status: 400 })
        }

        // Generate invoice number if not provided
        const finalInvoiceNo = invoiceNo || `INV-${Date.now()}`

        // Create sale from quotation
        const sale = await offlinePrisma.sale.create({
            data: {
                invoiceNo: finalInvoiceNo,
                subTotal: quotation.subTotal,
                taxRate: quotation.taxRate,
                notes: quotation.notes,
                amountPaid: amountPaid || quotation.grandTotal,
                grandTotal: quotation.grandTotal,
                paidAmount: quotation.grandTotal - (balance || 0),
                balance: balance || 0,
                warehousesId: quotation.warehousesId,
                selectedCustomerId: quotation.selectedCustomerId
            }
        })

        // Create sale items from quotation items
        const saleItems = quotation.quotationItems.map(item => ({
            saleId: sale.invoiceNo,
            productId: item.productId,
            productName: item.productName,
            cost: item.cost,
            selectedPrice: item.selectedPrice,
            priceType: item.priceType,
            quantity: item.quantity,
            discount: item.discount,
            total: item.total,
            profit: (item.selectedPrice - item.cost) * item.quantity,
            warehousesId: item.warehousesId,
            customerId: quotation.selectedCustomerId
        }))

        await offlinePrisma.saleItem.createMany({
            data: saleItems
        })

        // Update product quantities
        for (const item of quotation.quotationItems) {
            if (item.product) {
                await offlinePrisma.product.update({
                    where: { id: item.productId! },
                    data: {
                        quantity: {
                            decrement: item.quantity
                        }
                    }
                })
            }
        }

        // Create payment methods if provided
        if (paymentMethods && paymentMethods.length > 0) {
            const paymentData = paymentMethods.map((method: any) => ({
                saleId: sale.invoiceNo,
                method: method.method,
                amount: method.amount,
                warehousesId: quotation.warehousesId
            }))

            await offlinePrisma.paymentMethod.createMany({
                data: paymentData
            })
        }

        // Update quotation status
        await offlinePrisma.quotation.update({
            where: { quotationNo },
            data: {
                status: "converted",
                convertedToSaleId: sale.invoiceNo
            }
        })

        return NextResponse.json({
            message: "Quotation converted to sale successfully",
            sale: sale,
            invoiceNo: finalInvoiceNo
        }, { status: 201 })

    } catch (error) {
        console.error("Error converting quotation to sale:", error)
        return NextResponse.json("Error converting quotation to sale", { status: 500 })
    }
}