import type { StructureResolver } from "sanity/structure";

/** Editor navigation, ordered by how often staff need each item. */
export const structure: StructureResolver = (S) =>
  S.list()
    .title("STARS Academy website")
    .items([
      S.documentTypeListItem("announcement").title("Announcements & closures"),
      S.listItem()
        .title("FAQs")
        .child(
          S.list()
            .title("FAQs by audience")
            .items(
              [
                ["families", "Families considering STARS"],
                ["current", "Current families"],
                ["partners", "Physicians & referral partners"],
                ["jobs", "Job seekers"],
              ].map(([value, title]) =>
                S.listItem()
                  .title(title)
                  .child(
                    S.documentTypeList("faq")
                      .title(title)
                      .filter('_type == "faq" && group == $group')
                      .params({ group: value })
                      .defaultOrdering([{ field: "order", direction: "asc" }])
                      .initialValueTemplates([S.initialValueTemplateItem("faq-in-group", { group: value })]),
                  ),
              ),
            ),
        ),
      S.documentTypeListItem("jobOpening").title("Job openings"),
      S.documentTypeListItem("teamMember").title("Leadership"),
      S.documentTypeListItem("testimonial").title("Family testimonials"),
      S.divider(),
      S.listItem().title("Contact details").id("siteSettings").child(S.document().schemaType("siteSettings").documentId("siteSettings")),
    ]);
