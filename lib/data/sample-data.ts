export interface SamplePair {
  id: string;
  name: string;
  category: 'Paraphrased' | 'Exact Copy' | 'Original / Disparate';
  description: string;
  docA: {
    name: string;
    text: string;
  };
  docB: {
    name: string;
    text: string;
  };
}

export const SAMPLE_DATASETS: SamplePair[] = [
  {
    id: 'sample-paraphrase',
    name: 'Academic Paraphrasing (AI & Ethics)',
    category: 'Paraphrased',
    description: 'Demonstrates SBERT catching semantic paraphrasing where keywords are replaced with synonyms.',
    docA: {
      name: 'Student_Submission.docx',
      text: `Artificial intelligence algorithms are rapidly transforming modern higher education systems. Learners are now able to submit their coursework digitally and receive automated feedback on their assignments in real-time. Moreover, automated evaluation frameworks can evaluate student essays within seconds, drastically reducing the workload of academic professors. However, substantial ethical concerns emerge regarding data privacy and intellectual fairness. Educational institutions must formulate transparent standards to prevent academic dishonesty and protect student integrity.`
    },
    docB: {
      name: 'Published_Research_Paper.pdf',
      text: `Machine learning models are swiftly revolutionizing contemporary university environments. Students can submit assignments online and acquire instant computer-generated feedback on their homework. In addition, automated grading systems are capable of assessing pupil papers almost instantaneously, significantly lightening the grading burden on instructors. Nonetheless, critical moral dilemmas arise concerning confidentiality and algorithm bias. Universities ought to establish clear guidelines to mitigate cheating and preserve scholarly authenticity.`
    }
  },
  {
    id: 'sample-exact',
    name: 'Direct Copy-Paste (Quantum Computing)',
    category: 'Exact Copy',
    description: 'Demonstrates high TF-IDF and high Sentence-BERT detecting near-identical or copy-pasted text.',
    docA: {
      name: 'Lab_Report_Draft.docx',
      text: `Quantum computing leverages the fundamental principles of quantum mechanics to process complex computational calculations at unprecedented velocities. Unlike classical bits that represent either a 0 or a 1, quantum bits or qubits can exist in a superposition of states. Furthermore, quantum entanglement permits interconnected particles to communicate their states instantaneously across distances. These unique properties will enable quantum algorithms such as Shor's algorithm to crack traditional cryptographic encryption protocols.`
    },
    docB: {
      name: 'Reference_Textbook.pdf',
      text: `Quantum computing leverages the fundamental principles of quantum mechanics to process complex computational calculations at unprecedented velocities. Unlike classical bits that represent either a 0 or a 1, quantum bits or qubits can exist in a superposition of states. Furthermore, quantum entanglement permits interconnected particles to communicate their states instantaneously across distances. These unique properties will enable quantum algorithms such as Shor's algorithm to crack traditional cryptographic encryption protocols.`
    }
  },
  {
    id: 'sample-original',
    name: 'Original Comparison (Climate vs Economics)',
    category: 'Original / Disparate',
    description: 'Demonstrates low similarity (<15%) when two documents discuss completely distinct topics.',
    docA: {
      name: 'Climate_Impact_Report.pdf',
      text: `Global climate change has accelerated polar ice cap melting and triggered extreme meteorological events worldwide. Rising ocean temperatures have severely compromised coral reef biodiversity across the Pacific and Indian oceans. Renewable solar and wind energy infrastructures offer viable pathways toward sustainable decarbonization.`
    },
    docB: {
      name: 'Macroeconomics_Analysis.docx',
      text: `Central banks utilize monetary policy instruments such as interest rate adjustments and reserve requirements to regulate macroeconomic inflation. Global supply chain disruptions have impacted sovereign bond yields and foreign exchange reserves in emerging markets. Fiscal stimulus packages often stimulate capital investment during market recessions.`
    }
  }
];
