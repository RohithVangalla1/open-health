import {NextRequest, NextResponse} from "next/server";
import prisma, {Prisma} from "@/lib/prisma";
import {HealthData} from "@/app/api/health-data/route";
import {auth} from "@/auth";

export interface HealthDataPatchRequest {
    data?: Prisma.InputJsonValue
}

export interface HealthDataGetResponse {
    healthData: HealthData
}

export async function GET(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session || !session.user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    const {id} = await params
    const healthData = await prisma.healthData.findFirst({
        where: {id, authorId: session.user.id}
    })
    if (!healthData) return NextResponse.json({error: 'Not found'}, {status: 404})

    return NextResponse.json({healthData})
}

export async function PATCH(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session || !session.user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    const {id} = await params
    const body: HealthDataPatchRequest = await req.json()

    // Verify ownership before updating
    const existing = await prisma.healthData.findFirst({
        where: {id, authorId: session.user.id}
    })
    if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})

    const healthData = await prisma.healthData.update({
        where: {id},
        data: body
    })
    return NextResponse.json({healthData})
}

export async function DELETE(
    req: NextRequest,
    {params}: { params: Promise<{ id: string }> }
) {
    const session = await auth()
    if (!session || !session.user) return NextResponse.json({error: 'Unauthorized'}, {status: 401})

    const {id} = await params

    // Verify ownership before deleting
    const existing = await prisma.healthData.findFirst({
        where: {id, authorId: session.user.id}
    })
    if (!existing) return NextResponse.json({error: 'Not found'}, {status: 404})

    await prisma.healthData.delete({where: {id}})
    return NextResponse.json({})
}
