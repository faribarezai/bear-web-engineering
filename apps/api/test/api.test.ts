import * as assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { buildApp } from '../src/app.js';
import {
    InMemoryBearRepository,
    InMemoryCommentRepository,
} from '../src/repo/memory.js';

function createTestApp() {
    const bearRepo = new InMemoryBearRepository([
        {
            id: 'ursus-arctos',
            name: 'Brown bear',
            binomial: 'Ursus arctos',
            range: 'Eurasia and North America',
            image: null,
        },
    ]);
    const commentRepo = new InMemoryCommentRepository();

    return buildApp({
        bearRepo,
        commentRepo,
        checkReady: async () => true,
    });
}

describe('Bears & Comments API (In-Memory Repositories)', () => {
    it('lists bears and returns 404 for unknown bear', async () => {
        const app = await createTestApp();

        const listRes = await app.inject({ method: 'GET', url: '/bears' });
        assert.equal(listRes.statusCode, 200);
        assert.equal(listRes.json().length, 1);
        assert.equal(listRes.json()[0].id, 'ursus-arctos');

        const missingRes = await app.inject({
            method: 'GET',
            url: '/bears/unknown-bear',
        });
        assert.equal(missingRes.statusCode, 404);
        //assert.equal(missingRes.headers['content-type'], 'application/problem+json');
        //prüft, ob header mit application/problem+json beginnt
        assert.ok(
            missingRes.headers['content-type']?.startsWith('application/problem+json')
        );
        await app.close();
    });

    it('creates, lists, and deletes a comment for a bear', async () => {
        const app = await createTestApp();

        // 1. Kommentar erstellen
        const createRes = await app.inject({
            method: 'POST',
            url: '/bears/ursus-arctos/comments',
            payload: { author: 'Alice', text: 'Great bear!' },
        });
        assert.equal(createRes.statusCode, 201);
        const created = createRes.json();
        assert.equal(created.author, 'Alice');

        // 2. Kommentare abrufen
        const listRes = await app.inject({
            method: 'GET',
            url: '/bears/ursus-arctos/comments',
        });
        assert.equal(listRes.statusCode, 200);
        assert.equal(listRes.json().length, 1);

        // 3. Kommentar löschen
        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/comments/${created.id}`,
        });
        assert.equal(deleteRes.statusCode, 204);

        // 4. Danach ist die Liste wieder leer
        const afterDeleteRes = await app.inject({
            method: 'GET',
            url: '/bears/ursus-arctos/comments',
        });
        assert.equal(afterDeleteRes.json().length, 0);

        await app.close();
    });
});