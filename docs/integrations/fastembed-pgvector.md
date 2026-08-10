# Integration: FastEmbed & pgvector Semantic Search

FastEmbed and `pgvector` power AI semantic recommendations, enabling SetupSpot to recommend visually and semantically similar desk setups based on item annotations and descriptions.

---

## 🔌 Connection & Engine Wiring

- **Source File**: [`backend/services/recommendation_service.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/services/recommendation_service.py)
- **Embedding Model**: FastEmbed ONNX runtime using model `BAAI/bge-small-en-v1.5` (384-dimensional dense vectors).
- **Database Column**: PostgreSQL vector column (`Vector(384)`) enabled via `CREATE EXTENSION IF NOT EXISTS vector;`.
- **Model Model**: [`SetupEmbedding`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/models/embedding.py) / [`Setup.embedding`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/models/setup.py).

---

## 🔑 Environment Variables & Dependencies Required

| Dependency | Purpose | pyproject.toml |
| :--- | :--- | :--- |
| `fastembed` | Local CPU embedding generation | `>=0.8.0` |
| `pgvector` | SQLAlchemy vector types & cosine operators | `>=0.5.0` |
| `DATABASE_URL` | PostgreSQL connection with `vector` extension | [`config.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/core/config.py#L6) |

---

## 🔄 Data Flow

1. Setup Created/Updated -> `setup_service` triggers `background_index_setup`.
2. `recommendation_service.embed_and_save_setup(db, setup_id)`:
   - Formats setup name + item names/descriptions into text prompt.
   - `FastEmbed.embed([text])` generates 384-dim float vector.
   - Stores vector in `Setup.embedding` column in PostgreSQL.
3. User views Setup Detail page -> Frontend fetches `GET /setups/{id}/similar`.
4. Backend executes `Setup.embedding.cosine_distance(target_setup.embedding)` query in PostgreSQL to rank most similar setups.
5. Caches each page chunk in Upstash Redis (`similar:{setup_id}:page:{page}`) with 24-hour TTL.

---

## 🛡️ Failure Behavior & Fallbacks

- **Missing Embeddings**: If a target setup does not have a generated vector embedding yet, `get_similar_setups` falls back to fetching the newest setups (`ORDER BY Setup.id DESC`).
- **Insufficient Similar Matches**: If cosine distance query returns fewer items than the requested limit, `get_similar_setups` automatically pads the results with top liked popular setups ([`recommendation_service.py`](file:///home/creeksonjoseph/softwarengineering/personal-projects/SetupSpot/backend/services/recommendation_service.py#L130)).

---

## 💡 Gotchas

- **Local Inference**: FastEmbed runs ONNX model inference directly on CPU inside the Python backend process (no external API calls or billing costs).
- **First-Run Warmup**: The ONNX model weights (~130MB) are downloaded automatically on first model load to local cache.
