const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=UTF-8",
      ...corsHeaders
    }
  });
}

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders
      });
    }

    const url = new URL(request.url);
    const path = url.pathname;

    try {

      // =========================
      // TEST API
      // =========================
      if (path === "/" && request.method === "GET") {
        return json({
          ok: true,
          service: "PrettyGirls API",
          database: "D1 connected"
        });
      }

      // =========================
      // PROFILS
      // =========================

      if (path === "/profiles" && request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT *
          FROM profiles
          ORDER BY created_at DESC
        `).all();

        return json(results);
      }

      if (path === "/profiles" && request.method === "POST") {
        const body = await request.json();

        if (!body.id || !body.username) {
          return json(
            { error: "id et username obligatoires" },
            400
          );
        }

        await env.DB.prepare(`
          INSERT INTO profiles
          (id, username, display_name, bio, avatar_url)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          body.id,
          body.username,
          body.display_name || "",
          body.bio || "",
          body.avatar_url || ""
        ).run();

        return json({ ok: true }, 201);
      }

      // =========================
      // PUBLICATIONS
      // =========================

      if (path === "/posts" && request.method === "GET") {
        const { results } = await env.DB.prepare(`
          SELECT
            posts.*,
            profiles.username,
            profiles.display_name,
            profiles.avatar_url,
            (
              SELECT COUNT(*)
              FROM likes
              WHERE likes.post_id = posts.id
            ) AS likes_count,
            (
              SELECT COUNT(*)
              FROM comments
              WHERE comments.post_id = posts.id
            ) AS comments_count
          FROM posts
          JOIN profiles
            ON profiles.id = posts.profile_id
          ORDER BY posts.created_at DESC
        `).all();

        return json(results);
      }

      if (path === "/posts" && request.method === "POST") {
        const body = await request.json();

        if (!body.profile_id || !body.media_data) {
          return json(
            { error: "profile_id et media_data obligatoires" },
            400
          );
        }

        const result = await env.DB.prepare(`
          INSERT INTO posts
          (profile_id, media_type, media_data, caption, layout)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          body.profile_id,
          body.media_type || "external",
          body.media_data,
          body.caption || "",
          body.layout || "carousel"
        ).run();

        return json({
          ok: true,
          id: result.meta.last_row_id
        }, 201);
      }

      // =========================
      // LIKES
      // =========================

      if (path === "/likes" && request.method === "POST") {
        const body = await request.json();

        if (!body.profile_id || !body.post_id) {
          return json(
            { error: "profile_id et post_id obligatoires" },
            400
          );
        }

        await env.DB.prepare(`
          INSERT OR IGNORE INTO likes
          (profile_id, post_id)
          VALUES (?, ?)
        `).bind(
          body.profile_id,
          body.post_id
        ).run();

        return json({ ok: true });
      }

      if (path === "/likes" && request.method === "DELETE") {
        const body = await request.json();

        await env.DB.prepare(`
          DELETE FROM likes
          WHERE profile_id = ?
          AND post_id = ?
        `).bind(
          body.profile_id,
          body.post_id
        ).run();

        return json({ ok: true });
      }

      // =========================
      // COMMENTAIRES
      // =========================

      if (path === "/comments" && request.method === "GET") {
        const postId = url.searchParams.get("post_id");

        if (!postId) {
          return json({ error: "post_id obligatoire" }, 400);
        }

        const { results } = await env.DB.prepare(`
          SELECT
            comments.*,
            profiles.username,
            profiles.display_name,
            profiles.avatar_url
          FROM comments
          JOIN profiles
            ON profiles.id = comments.profile_id
          WHERE comments.post_id = ?
          ORDER BY comments.created_at ASC
        `).bind(postId).all();

        return json(results);
      }

      if (path === "/comments" && request.method === "POST") {
        const body = await request.json();

        if (!body.profile_id || !body.post_id || !body.content) {
          return json(
            { error: "profile_id, post_id et content obligatoires" },
            400
          );
        }

        const result = await env.DB.prepare(`
          INSERT INTO comments
          (post_id, profile_id, content)
          VALUES (?, ?, ?)
        `).bind(
          body.post_id,
          body.profile_id,
          body.content
        ).run();

        return json({
          ok: true,
          id: result.meta.last_row_id
        }, 201);
      }

      // =========================
      // ABONNEMENTS
      // =========================

      if (path === "/follows" && request.method === "POST") {
        const body = await request.json();

        if (!body.follower_id || !body.following_id) {
          return json(
            { error: "follower_id et following_id obligatoires" },
            400
          );
        }

        await env.DB.prepare(`
          INSERT OR IGNORE INTO follows
          (follower_id, following_id)
          VALUES (?, ?)
        `).bind(
          body.follower_id,
          body.following_id
        ).run();

        return json({ ok: true });
      }

      if (path === "/follows" && request.method === "DELETE") {
        const body = await request.json();

        await env.DB.prepare(`
          DELETE FROM follows
          WHERE follower_id = ?
          AND following_id = ?
        `).bind(
          body.follower_id,
          body.following_id
        ).run();

        return json({ ok: true });
      }

      // =========================
      // PUBLICATIONS ENREGISTRÉES
      // =========================

      if (path === "/saved-posts" && request.method === "POST") {
        const body = await request.json();

        if (!body.profile_id || !body.post_id) {
          return json(
            { error: "profile_id et post_id obligatoires" },
            400
          );
        }

        await env.DB.prepare(`
          INSERT OR IGNORE INTO saved_posts
          (profile_id, post_id)
          VALUES (?, ?)
        `).bind(
          body.profile_id,
          body.post_id
        ).run();

        return json({ ok: true });
      }

      if (path === "/saved-posts" && request.method === "DELETE") {
        const body = await request.json();

        await env.DB.prepare(`
          DELETE FROM saved_posts
          WHERE profile_id = ?
          AND post_id = ?
        `).bind(
          body.profile_id,
          body.post_id
        ).run();

        return json({ ok: true });
      }

      // =========================
      // ROUTE INCONNUE
      // =========================

      return json({ error: "Route introuvable" }, 404);

    } catch (error) {
      console.error(error);

      return json({
        ok: false,
        error: error.message
      }, 500);
    }
  }
};
