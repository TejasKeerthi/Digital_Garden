package com.secondbrain.model.graph;

import org.springframework.data.neo4j.core.schema.*;
import lombok.Data;
import java.util.List;

/**
 * Neo4j Node Entity: Represents the Note as a Concept in the overarching Graph.
 */
@Node("Note")
@Data
public class GraphNote {

    @Id
    private String noteId; // Corresponds directly to Postgres Note ID.

    private String title;
    
    // Outgoing relationships to other notes, establishing the mesh network
    @Relationship(type = "SMART_CONNECTION", direction = Relationship.Direction.OUTGOING)
    private List<Connection> relatedNotes;
}
