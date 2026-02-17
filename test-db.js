async function test() {
    const key = 'sb_publishable_kdDCQvowBKawUJf32pUfXw_5xQWZO8i';
    const url = 'https://sbrmrprueoxakfhzargb.supabase.co';

    const tests = [
        // content_dna - try JSONB / text blob patterns
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000', tone: 'test' } },
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000', analysis: 'test' } },
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000', hook_style: 'test' } },
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000', dna: '{}' } },
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000', result: '{}' } },
        { table: 'content_dna', fields: { user_id: '00000000-0000-0000-0000-000000000000' } },
        // weekly_reports - try JSONB patterns
        { table: 'weekly_reports', fields: { user_id: '00000000-0000-0000-0000-000000000000' } },
        { table: 'weekly_reports', fields: { user_id: '00000000-0000-0000-0000-000000000000', data: '{}' } },
        { table: 'weekly_reports', fields: { user_id: '00000000-0000-0000-0000-000000000000', insights: 'test' } },
        { table: 'weekly_reports', fields: { user_id: '00000000-0000-0000-0000-000000000000', recommendations: 'test' } },
        { table: 'weekly_reports', fields: { user_id: '00000000-0000-0000-0000-000000000000', week_start: '2024-01-01' } },
        // performance_data - check all expected columns
        { table: 'performance_data', fields: { user_id: '00000000-0000-0000-0000-000000000000', views: 1, watch_time_percent: 50, likes: 1, comments: 1, saves: 1, leads_generated: 1 } },
        { table: 'performance_data', fields: { user_id: '00000000-0000-0000-0000-000000000000', views: 1, watch_time: 50, likes: 1, comments: 1, saves: 1, leads: 1 } },
    ];

    for (const t of tests) {
        const resp = await fetch(`${url}/rest/v1/${t.table}`, {
            method: 'POST',
            headers: {
                'apikey': key,
                'Authorization': `Bearer ${key}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=representation'
            },
            body: JSON.stringify(t.fields)
        });
        const body = await resp.text();
        const cols = Object.keys(t.fields).join(', ');
        const short = body.length > 120 ? body.substring(0, 120) + '...' : body;
        console.log(`${t.table} [${cols}]: ${resp.status} - ${short}`);
    }
}

test().catch(e => console.error('Error:', e.message));
