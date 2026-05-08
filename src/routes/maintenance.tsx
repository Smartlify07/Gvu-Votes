import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/maintenance')({
    component: RouteComponent,
})

function RouteComponent() {
    return <section>
        <h1 className='text-3xl w-xl'>This site is currently in maintenance mode, we're working really hard to restore services</h1>

    </section>
}
