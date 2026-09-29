/** Datos de contacto reales de la entidad (tomados de la web antigua). */
export const site = {
  name: "Família Amic",
  email: "familiaamic@gmail.com",
  phones: ["+34 623 101 549", "+34 608 216 307", "+34 610 914 471"],
  whatsapp: "34610914471",
  address: "Carrer Lli, 7, 08197 Valldoreix (Barcelona)",
  instagram: "https://instagram.com/familiaamic/",
  /** Bizum para donativos (el de la web antigua). */
  bizum: "610 91 44 71",
  /** IBAN para donativos por transferencia. Vacío = no se muestra; lo confirma la junta antes de publicarlo. */
  donationIban: "",
  /** Registros oficiales de la entidad. */
  registry: { generalitat: "41751", municipal: "592" },
  /** Formulario externo del canal de denuncias (Google Forms de la entidad). */
  complaintsForm: "https://docs.google.com/forms/d/e/1FAIpQLSfj5YHWTPYFHzT5ul1nX5j301EHGQXEa2t3t25-QinXwo4Y1w/viewform",
} as const;
