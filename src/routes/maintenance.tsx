import { createFileRoute } from '@tanstack/react-router'
import { Wrench } from 'lucide-react'

export const Route = createFileRoute('/maintenance')({
    component: RouteComponent,
})

function RouteComponent() {
    return (
        <section className='min-h-svh flex flex-col items-center justify-center gap-8 px-4'>
            <div className='rounded-full bg-muted p-6'>
                <Wrench className='h-12 w-12 text-muted-foreground animate-pulse' />
            </div>
            <div className='flex flex-col gap-2 text-center max-w-lg'>
                <h1 className='text-4xl font-bold tracking-tight'>Under Maintenance</h1>
                <p className='text-lg text-muted-foreground'>
                    We're currently performing scheduled upgrades to improve your experience.
                    We'll be back online shortly.
                </p>
            </div>
            <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                <span className='inline-block h-2 w-2 rounded-full bg-amber-500' />
                Expected back soon
            </div>
        </section>
    )
}
