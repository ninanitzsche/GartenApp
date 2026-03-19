# Gartenplaner Phase 2 - Requirements

**Last Updated:** 2026-03-19
**Milestone:** AI Features

---

## v2 Requirements (Phase 2)

### AI-01: Plant Identification
- [ ] User can upload photo from camera
- [ ] User can upload photo from gallery
- [ ] System identifies plant using Claude Vision API
- [ ] System returns plant name with confidence score
- [ ] Identification links to existing plant database

### AI-02: Pest/Disease Detection
- [ ] System analyzes photo for common issues
- [ ] System detects 5+ common problems (aphids, powdery mildew, etc.)
- [ ] System shows treatment recommendation
- [ ] System links to knowledge base articles

### AI-03: Photo-Driven Task Suggestions
- [ ] After identification, system suggests relevant tasks
- [ ] Tasks match plant's current needs
- [ ] User can accept suggested task
- [ ] User can dismiss suggested task

### AI-04: AI Integration
- [ ] Identifications cached locally (AsyncStorage)
- [ ] Cache reduces API calls for known plants
- [ ] AI results stored with photo metadata
- [ ] Works with existing photo gallery

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real-time video analysis | Too complex, battery drain |
| Sensor integration | Hardware, not MVP scope |
| Social sharing | Not core value proposition |

---

## Traceability

| REQ-ID | Phase |
|--------|-------|
| AI-01 | 1 |
| AI-02 | 2 |
| AI-03 | 3 |
| AI-04 | 4 |

---

*Created: 2026-03-19*
