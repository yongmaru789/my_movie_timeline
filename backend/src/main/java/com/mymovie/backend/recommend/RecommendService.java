package com.mymovie.backend.recommend;

import com.mymovie.backend.movie.Movie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RecommendService {

    @Value("${claude.api.key}")
    private String claudeApiKey;

    private static final String CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

    public String getRecommendation(List<Movie> movies) {
        String movieSummary = movies.stream()
                .filter(m -> m.getRating() >= 4.0)
                .map(m -> String.format("제목: %s, 별점: %.1f, 장르: %s, 메모: %s",
                        m.getTitle(),
                        m.getRating(),
                        m.getGenres() != null ? String.join(", ", m.getGenres()) : "없음",
                        m.getMemo() != null ? m.getMemo() : "없음"))
                .collect(Collectors.joining("\n"));
        if (movieSummary.isBlank()) {
            return "별점 4점 이상인 영화가 없어서 추천을 드리기 어렵습니다.";
        }

        String prompt = """
        다음은 내가 최근에 보고 높은 별점을 준 영화 목록이야:
        
        %s
        
        이 취향을 바탕으로 내가 좋아할 만한 영화 5편을 추천해줘.
        반드시 아래 JSON 형식으로만 응답해줘. 다른 텍스트는 절대 포함하지 마.
        
        [
          {
            "title": "영화 제목",
            "year": "개봉연도",
            "genres": "장르1 · 장르2",
            "reason": "추천 이유 한두 문장"
          }
        ]
        """.formatted(movieSummary);

        try {
            String requestBody = """
                    {
                        "model": "claude-sonnet-4-20250514",
                        "max_tokens": 1000,
                        "messages": [
                            {"role": "user", "content": "%s"}
                        ]
                    }
                    """.formatted(prompt.replace("\"", "\\\"").replace("\n", "\\n"));

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(CLAUDE_API_URL))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", claudeApiKey)
                    .header("anthropic-version", "2023-06-01")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<byte[]> response = HttpClient.newHttpClient()
                    .send(request, HttpResponse.BodyHandlers.ofByteArray());

            String body = new String(response.body(), java.nio.charset.StandardCharsets.UTF_8);

            org.json.JSONObject json = new org.json.JSONObject(body);
            String result = json.getJSONArray("content")
                    .getJSONObject(0)
                    .getString("text");
            return result;

        } catch (Exception e) {
            return "추천을 가져오는 중 오류가 발생했습니다: " + e.getMessage();
        }
    }
}