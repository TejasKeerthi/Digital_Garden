package com.secondbrain.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import java.util.*;

/**
 * AI Service Layer that interfaces directly with LLMs (e.g. OpenAI/Ollama APIs)
 * to facilitate 'Zettelkasten' principle context discovery.
 */
@Service
public class AILinkingService {

    @Value("${llm.api.key}")
    private String apiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Primary method that takes note parameters and executes intelligent bridging.
     */
    public List<SuggestedLink> suggestConnections(String currentNoteText, List<String> existingNotesPool) {
        String prompt = buildPrompt(currentNoteText, existingNotesPool);

        // Core AI Interaction: Can be swapped with Spring AI interface or RestTemplate
        String aiResponse = mockCallLLM(prompt);

        return parseAiResponse(aiResponse);
    }

    private String buildPrompt(String noteContent, List<String> availableNotes) {
        return String.format(
                "You are an AI Zettelkasten assistant mapping an educational 'Small-World Network'.\n" +
                        "Review the newly submitted note and identify high-value semantic connections to the existing notes array.\n"
                        +
                        "Existing Notes: %s\n\n" +
                        "New Note Content:\n%s\n\n" +
                        "Output strictly as a JSON array comprising objects with keys: 'targetNoteTitle', 'confidence', 'reasoning'.",
                String.join(", ", availableNotes), noteContent);
    }

    private String mockCallLLM(String prompt) {
        // Mock Response simulating a successful payload returned from external AI
        return "[\n" +
                "  {\"targetNoteTitle\": \"Garbage Collection in Java\", \"confidence\": 0.92, \"reasoning\": \"Both cover conceptual memory management and lifecycle allocation mechanisms.\"}\n"
                +
                "]";
    }

    private List<SuggestedLink> parseAiResponse(String jsonResponse) {
        try {
            return Arrays.asList(objectMapper.readValue(jsonResponse, SuggestedLink[].class));
        } catch (Exception e) {
            e.printStackTrace();
            return Collections.emptyList();
        }
    }

    /**
     * Internal DTO holding extrapolated connection metadata.
     */
    public static class SuggestedLink {
        public String targetNoteTitle;
        public Double confidence;
        public String reasoning;
    }
}
