{{-- Visible breadcrumb. The matching BreadcrumbList JSON-LD is built in the
     controller, from the same array. $crumbClass puts it over a hero or in flow. --}}
@if (!empty($breadcrumb))
    <nav class="crumbs {{ $crumbClass ?? '' }}" aria-label="Breadcrumb">
        <ol>
            <li><a href="{{ url('/') }}">Home</a></li>
            @foreach ($breadcrumb as $crumb)
                <li><a href="{{ url($crumb['url']) }}">{{ $crumb['name'] }}</a></li>
            @endforeach
        </ol>
    </nav>
@endif
