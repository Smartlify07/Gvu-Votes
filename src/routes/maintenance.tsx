import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/maintenance')({
    component: RouteComponent,
})

function RouteComponent() {
    return <section className='min-h-svh justify-center flex items-center'>
        <h1 className='text-3xl w-2xl text-center'>This site is currently in maintenance mode, we're working really hard to restore our services</h1>

    </section>
}
