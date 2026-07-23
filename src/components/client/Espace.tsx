"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/client/auth";
import { backend } from "@/lib/client/backend";
import { resumeFormule, type Agence, type Job } from "@/lib/client/types";
import CoquilleEspace, { Ico } from "./CoquilleEspace";
import { BoutonBraise, EnTetePage, EtatVide, Pastille, TuileStat } from "./Interface";
import NouvelleDemande from "./NouvelleDemande";
import MesDemandes from "./MesDemandes";
import AideBulle from "./AideBulle";

type Vue = "apercu" | "demandes" | "nouvelle" | "agence";

const EN_COURS = ["recu", "analyse", "en_production", "controle_qualite"];

/* Vue d'ensemble : l'état du compte d'un coup d'œil, puis l'activité. */
function Apercu({
  jobs,
  restants,
  formule,
  onOuvrir,
  onNouvelle,
}: {
  jobs: Job[];
  restants: number | null;
  formule?: string;
  onOuvrir: (id: string) => void;
  onNouvelle: () => void;
}) {
  const enCours = jobs.filter((j) => EN_COURS.includes(j.status)).length;
  const livrees = jobs.filter((j) => j.status === "livre").length;
  const aCompleter = jobs.filter((j) => j.status === "attention_requise");
  const recentes = jobs.slice(0, 4);

  return (
    <div className="flex flex-col gap-8">
      <EnTetePage titre="Vue d'ensemble" sous={formule ? `FORMULE ${formule.toUpperCase()}` : undefined} />

      {aCompleter.length > 0 ? (
        <button
          type="button"
          onClick={() => onOuvrir(aCompleter[0].id)}
          className="flex items-center justify-between gap-4 px-4 py-3.5 text-left transition-colors duration-200 hover:border-(--color-braise-vive)"
          style={{ border: "1px solid var(--color-braise)", background: "var(--color-basalte-2)" }}
        >
          <span className="voix-mono" style={{ color: "var(--color-braise-vive)", lineHeight: 1.5 }}>
            {aCompleter.length > 1
              ? `${aCompleter.length} DEMANDES ATTENDENT UNE PRÉCISION`
              : `« ${aCompleter[0].property.title.toUpperCase()} » ATTEND UNE PRÉCISION`}
          </span>
          <span aria-hidden="true" className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            →
          </span>
        </button>
      ) : null}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TuileStat label="FILMS RESTANTS CE MOIS-CI" valeur={restants ?? "·"} accent />
        <TuileStat label="EN PRODUCTION" valeur={enCours} />
        <TuileStat label="LIVRÉES" valeur={livrees} />
        <TuileStat label="DEMANDES AU TOTAL" valeur={jobs.length} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-baseline justify-between">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            DERNIÈRES DEMANDES
          </p>
          <BoutonBraise onClick={onNouvelle} className="!px-5 !py-2.5">
            Nouvelle demande
          </BoutonBraise>
        </div>
        {recentes.length === 0 ? (
          <EtatVide titre="VOTRE PREMIÈRE DEMANDE LANCE LA PRODUCTION. COMPTEZ 72 H ENTRE LE DÉPÔT DES PHOTOS ET LE FILM LIVRÉ." />
        ) : (
          <ul className="flex flex-col" style={{ borderTop: "1px solid var(--color-filet)" }}>
            {recentes.map((j) => (
              <li key={j.id} style={{ borderBottom: "1px solid var(--color-filet)" }}>
                <button
                  type="button"
                  onClick={() => onOuvrir(j.id)}
                  className="group flex w-full flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4 text-left"
                >
                  <span
                    className="transition-colors duration-200 group-hover:text-(--color-braise-vive)"
                    style={{ color: "var(--color-pierre)", fontSize: "1.02rem" }}
                  >
                    {j.property.title}
                  </span>
                  <Pastille status={j.status} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

/* L'agence : le workspace, sa formule, son équipe, l'invitation des
   collègues (rattachés automatiquement à l'espace de l'agence). */
function VueAgence({
  agence,
  restants,
  emailCourant,
}: {
  agence: (Agence & { membres: string[] }) | null;
  restants: number | null;
  emailCourant: string;
}) {
  const [lien, setLien] = useState("");
  const [erreur, setErreur] = useState("");

  if (!agence) return null;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <EnTetePage titre={agence.nom} sous={`FORMULE ${agence.formule.nom.toUpperCase()} · ${resumeFormule(agence.formule)}`} />

      <div className="grid grid-cols-2 gap-3 sm:max-w-sm">
        <TuileStat label="FILMS RESTANTS CE MOIS-CI" valeur={restants ?? "·"} accent />
        <TuileStat label="MEMBRES" valeur={agence.membres.length} />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
            L&apos;ÉQUIPE
          </p>
          <BoutonBraise
            className="!px-5 !py-2.5"
            onClick={async () => {
              setErreur("");
              try {
                const { lienInvitation } = await backend.inviterMembre();
                setLien(lienInvitation);
              } catch {
                setErreur("Invitation impossible.");
              }
            }}
          >
            Inviter un collègue
          </BoutonBraise>
        </div>

        <ul className="flex flex-col" style={{ borderTop: "1px solid var(--color-filet)" }}>
          {agence.membres.map((m) => (
            <li
              key={m}
              className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3.5"
              style={{ borderBottom: "1px solid var(--color-filet)" }}
            >
              <span style={{ color: "var(--color-pierre)" }}>{m}</span>
              {m === emailCourant ? (
                <span className="voix-mono" style={{ color: "var(--color-bronze)" }}>
                  VOUS
                </span>
              ) : null}
            </li>
          ))}
        </ul>

        {lien ? (
          <div className="flex flex-col gap-2 p-4" style={{ border: "1px solid var(--color-filet)", background: "var(--color-basalte-2)" }}>
            <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
              LIEN À TRANSMETTRE À VOTRE COLLÈGUE · VALABLE UNE FOIS
            </p>
            <p className="voix-mono break-all" style={{ color: "var(--color-pierre)", lineHeight: 1.6 }}>
              {lien}
            </p>
            <p className="voix-mono" style={{ color: "var(--color-gris-pierre)", lineHeight: 1.6 }}>
              IL CRÉERA SES ACCÈS ET REJOINDRA AUTOMATIQUEMENT L&apos;ESPACE DE {agence.nom.toUpperCase()}.
            </p>
          </div>
        ) : null}
        {erreur ? (
          <p className="voix-mono" style={{ color: "var(--color-braise-vive)" }}>
            {erreur}
          </p>
        ) : null}
      </section>
    </div>
  );
}

export default function Espace() {
  const router = useRouter();
  const { user, pret, deconnexion } = useAuth();
  const [vue, setVue] = useState<Vue>("apercu");
  const [ouvert, setOuvert] = useState<string | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [agence, setAgence] = useState<(Agence & { membres: string[] }) | null>(null);
  const [restants, setRestants] = useState<number | null>(null);
  const [stagingUtilises, setStagingUtilises] = useState(0);

  const charger = useCallback(async () => {
    setJobs(await backend.mesJobs());
    setAgence(await backend.monAgence());
    setRestants(await backend.filmsRestants());
    setStagingUtilises(await backend.stagingUtilisesCeMois());
  }, []);

  useEffect(() => {
    if (!pret) return;
    if (!user) {
      router.replace("/connexion");
      return;
    }
    if (user.role === "vesta") {
      router.replace("/vesta-studio");
      return;
    }
    charger();
  }, [pret, user, router, charger]);

  if (!pret || !user || user.role === "vesta") return null;

  const alerte = jobs.some((j) => j.status === "attention_requise");

  return (
    <CoquilleEspace
      marque="ESPACE CLIENT"
      nav={[
        { id: "apercu", libelle: "Vue d'ensemble", icone: Ico.apercu },
        { id: "demandes", libelle: "Demandes", icone: Ico.demandes, alerte },
        { id: "nouvelle", libelle: "Nouvelle demande", icone: Ico.nouvelle },
        { id: "agence", libelle: "Agence", icone: Ico.comptes },
      ]}
      actif={vue}
      onChange={(id) => {
        setVue(id as Vue);
        setOuvert(null);
      }}
      agence={agence?.nom}
      email={user.email}
      onDeconnexion={() => {
        deconnexion();
        router.replace("/");
      }}
    >
      {vue === "apercu" ? (
        <Apercu
          jobs={jobs}
          restants={restants}
          formule={agence?.formule.nom}
          onOuvrir={(id) => {
            setOuvert(id);
            setVue("demandes");
          }}
          onNouvelle={() => setVue("nouvelle")}
        />
      ) : null}

      {vue === "demandes" ? (
        <MesDemandes
          jobs={jobs}
          ouvert={ouvert}
          onOuvrir={setOuvert}
          onMaj={charger}
          onNouvelle={() => setVue("nouvelle")}
        />
      ) : null}

      {vue === "nouvelle" ? (
        <NouvelleDemande
          formule={agence?.formule}
          restants={restants}
          stagingUtilises={stagingUtilises}
          onEnvoye={async () => {
            await charger();
            setVue("demandes");
          }}
        />
      ) : null}

      {vue === "agence" ? <VueAgence agence={agence} restants={restants} emailCourant={user.email} /> : null}

      <AideBulle />
    </CoquilleEspace>
  );
}
