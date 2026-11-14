# Testing plan

Verification will grow with the implementation: unit checks for date normalization, quote matching, and confidence; schema checks for extraction responses; API checks for authentication and task transitions; and an end-to-end transcript-to-approved-dashboard flow. A labelled edge-case dataset will include missing owners, ambiguous dates, conflicts, and non-action statements.

The acceptance workflow must prove that an unapproved task never triggers an external action. Tests will be added alongside the features they cover.
