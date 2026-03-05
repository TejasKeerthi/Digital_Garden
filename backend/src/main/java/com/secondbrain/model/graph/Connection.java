package com.secondbrain.model.graph;

import org.springframework.data.neo4j.core.schema.*;
import lombok.Data;

/**
 * Neo4j Relationship Entity: Models edge properties between two connected
 * notes.
 */
@RelationshipProperties
@Data
public class Connection {

    @RelationshipId
    private Long id;

    @TargetNode
    private GraphNote target;

    // Indicates whether the AI generated this edge (Smart Connection) vs User
    // standard linking
    private boolean aiGenerated;

    private Double confidenceScore;

    // An AI-derived semantic reason explaining why 'A' is related to 'B'.
    private String connectionReason;
}
