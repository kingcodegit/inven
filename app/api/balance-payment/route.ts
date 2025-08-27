import { NextRequest, NextResponse } from "next/server";
import offlinePrisma from "@/lib/oflinePrisma";

// POST - Create a new balance payment
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { customerId, supplierId, saleId, purchaseId, amount, paymentMethod, notes, warehousesId } = body;

        // Validate required fields - either customerId or supplierId must be provided
        if ((!customerId && !supplierId) || !amount || !paymentMethod) {
            return NextResponse.json(
                { error: "Customer ID or Supplier ID, amount, and payment method are required" },
                { status: 400 }
            );
        }

        // Both customerId and supplierId cannot be provided
        if (customerId && supplierId) {
            return NextResponse.json(
                { error: "Cannot provide both customer ID and supplier ID" },
                { status: 400 }
            );
        }

        let customer = null;
        let supplier = null;

        // Check if customer exists (for customer payments)
        if (customerId) {
            customer = await offlinePrisma.customer.findUnique({
                where: { id: customerId, isDeleted: false }
            });

            if (!customer) {
                return NextResponse.json(
                    { error: "Customer not found" },
                    { status: 404 }
                );
            }
        }

        // Check if supplier exists (for supplier payments)
        if (supplierId) {
            supplier = await offlinePrisma.supplier.findUnique({
                where: { id: supplierId, isDeleted: false }
            });

            if (!supplier) {
                return NextResponse.json(
                    { error: "Supplier not found" },
                    { status: 404 }
                );
            }
        }

        // If saleId is provided, check if sale exists and has outstanding balance
        let sale = null;
        if (saleId) {
            sale = await offlinePrisma.sale.findUnique({
                where: { invoiceNo: saleId, isDeleted: false }
            });

            if (!sale) {
                return NextResponse.json(
                    { error: "Sale not found" },
                    { status: 404 }
                );
            }

            if (sale.balance <= 0) {
                return NextResponse.json(
                    { error: "Sale has no outstanding balance" },
                    { status: 400 }
                );
            }

            if (amount > sale.balance) {
                return NextResponse.json(
                    { error: "Payment amount cannot exceed outstanding balance" },
                    { status: 400 }
                );
            }
        }

        // If purchaseId is provided, check if purchase exists and has outstanding balance
        let purchase = null;
        if (purchaseId) {
            purchase = await offlinePrisma.purchase.findUnique({
                where: { referenceNo: purchaseId, isDeleted: false }
            });

            if (!purchase) {
                return NextResponse.json(
                    { error: "Purchase not found" },
                    { status: 404 }
                );
            }

            if (purchase.balance <= 0) {
                return NextResponse.json(
                    { error: "Purchase has no outstanding balance" },
                    { status: 400 }
                );
            }

            if (amount > purchase.balance) {
                return NextResponse.json(
                    { error: "Payment amount cannot exceed outstanding balance" },
                    { status: 400 }
                );
            }
        }

        // Generate unique receipt number
        const timestamp = Date.now();
        const receiptNo = `BP-${timestamp}`;

        // Create balance payment record
        const balancePayment = await offlinePrisma.balancePayment.create({
            data: {
                customerId: customerId || null,
                supplierId: supplierId || null,
                saleId: saleId || null,
                purchaseId: purchaseId || null,
                amount: parseFloat(amount),
                paymentMethod,
                receiptNo,
                notes: notes || null,
                warehousesId: warehousesId || null
            },
            include: {
                customer: true,
                supplier: true,
                sale: true,
                purchase: true
            }
        });

        // Update sale balance if saleId is provided
        if (saleId && sale) {
            const newBalance = sale.balance - parseFloat(amount);
            const newPaidAmount = sale.paidAmount + parseFloat(amount);

            await offlinePrisma.sale.update({
                where: { invoiceNo: saleId },
                data: {
                    balance: newBalance,
                    paidAmount: newPaidAmount
                }
            });
        }

        // Update purchase balance if purchaseId is provided
        if (purchaseId && purchase) {
            const newBalance = purchase.balance - parseFloat(amount);
            const newPaidAmount = purchase.paidAmount + parseFloat(amount);

            await offlinePrisma.purchase.update({
                where: { referenceNo: purchaseId },
                data: {
                    balance: newBalance,
                    paidAmount: newPaidAmount
                }
            });
        }

        return NextResponse.json({
            success: true,
            balancePayment,
            message: "Balance payment processed successfully"
        }, { status: 201 });

    } catch (error) {
        console.error("Error processing balance payment:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await offlinePrisma.$disconnect();
    }
}

// GET - Fetch balance payments for a customer or supplier
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');
        const supplierId = searchParams.get('supplierId');

        if (!customerId && !supplierId) {
            return NextResponse.json(
                { error: "Customer ID or Supplier ID is required" },
                { status: 400 }
            );
        }

        if (customerId && supplierId) {
            return NextResponse.json(
                { error: "Cannot provide both customer ID and supplier ID" },
                { status: 400 }
            );
        }

        const whereClause = customerId 
            ? { customerId, isDeleted: false }
            : { supplierId, isDeleted: false };

        const balancePayments = await offlinePrisma.balancePayment.findMany({
            where: whereClause,
            include: {
                customer: true,
                supplier: true,
                sale: true,
                purchase: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json({
            success: true,
            balancePayments
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching balance payments:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    } finally {
        await offlinePrisma.$disconnect();
    }
}