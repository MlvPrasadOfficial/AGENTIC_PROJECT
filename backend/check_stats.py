import asyncio
from pinecone import PineconeAsyncio
from app.core.config import settings

async def check_current_stats():
    pc = PineconeAsyncio(api_key=settings.PINECONE_API_KEY)
    async with pc as client:
        idx_desc = await client.describe_index(settings.PINECONE_INDEX_NAME)
        async with client.IndexAsyncio(host=idx_desc.host) as idx:
            stats = await idx.describe_index_stats()
            print(f'Current vector count: {stats.total_vector_count}')
            print(f'Namespaces: {dict(stats.namespaces)}')

asyncio.run(check_current_stats())
