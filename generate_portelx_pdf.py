import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.pdfgen import canvas
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_decorations(self, page_count):
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#475569"))
        
        # Running Header (pages > 1)
        if self._pageNumber > 1:
            self.drawString(54, 752, "PortelX — Universal Temporary Identity Layer | Master Specification")
            self.setFont("Helvetica", 8)
            self.drawRightString(558, 752, "Doc Ver: 1.0 • Approved")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.75)
            self.line(54, 744, 558, 744)

        # Running Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.75)
        self.line(54, 45, 558, 45)
        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(54, 32, "CONFIDENTIAL — PortelX Master Specification & Phased Roadmap (0% → 100%)")
        self.drawRightString(558, 32, f"Page {self._pageNumber} of {page_count}")
        self.restoreState()

def create_portelx_pdf(filename="PortelX_Specification_Document.pdf"):
    # Printable area: 612 x 792, margins 54pt -> content width 504pt, content height 684pt
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=54,
        rightMargin=54,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()
    
    # Custom color palette
    primary_color = colors.HexColor("#0F172A")    # Deep Navy Slate
    accent_blue = colors.HexColor("#1D4ED8")      # Rich Royal Blue
    text_dark = colors.HexColor("#0F172A")
    text_body = colors.HexColor("#334155")
    text_muted = colors.HexColor("#64748B")
    bg_light = colors.HexColor("#F8FAFC")
    bg_callout = colors.HexColor("#EFF6FF")
    border_color = colors.HexColor("#CBD5E1")
    
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=23,
        leading=27,
        textColor=primary_color,
        spaceAfter=2
    )
    
    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=11.5,
        leading=15,
        textColor=accent_blue,
        spaceAfter=8
    )
    
    meta_style = ParagraphStyle(
        'MetaText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=text_muted
    )

    h1_style = ParagraphStyle(
        'Heading1_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12.5,
        leading=16,
        textColor=primary_color,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )
    
    h2_style = ParagraphStyle(
        'Heading2_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=13.5,
        textColor=accent_blue,
        spaceBefore=7,
        spaceAfter=3,
        keepWithNext=True
    )
    
    h3_style = ParagraphStyle(
        'Heading3_Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=text_dark,
        spaceBefore=5,
        spaceAfter=2,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'Body_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.3,
        leading=11.8,
        textColor=text_body,
        alignment=TA_JUSTIFY,
        spaceAfter=4
    )

    bullet_style = ParagraphStyle(
        'Bullet_Custom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.4,
        textColor=text_body,
        leftIndent=12,
        firstLineIndent=-9,
        spaceAfter=2.5
    )

    callout_style = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.2,
        leading=11.8,
        textColor=colors.HexColor("#1E3A8A"),
        alignment=TA_JUSTIFY
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=7.8,
        leading=10.5,
        textColor=text_body
    )
    
    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=7.8,
        leading=10.5,
        textColor=text_dark
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ==================== PAGE 1: TITLE, META, SUMMARY & PROBLEM ====================
    story.append(Paragraph("PortelX", title_style))
    story.append(Paragraph("Universal Temporary Identity Layer — Software Requirements Specification & Phased Roadmap", subtitle_style))
    
    meta_data = [
        [Paragraph("<b>Document Version:</b> 1.0", meta_style), Paragraph("<b>Lead Architect:</b> Himanshu Badgujar", meta_style), Paragraph("<b>Implementation Status:</b> Approved", meta_style)],
        [Paragraph("<b>Date:</b> September 2026", meta_style), Paragraph("<b>Project Code:</b> PORTELX-V1", meta_style), Paragraph("<b>Progress Objective:</b> 0% → 100% Production", meta_style)],
        [Paragraph("<b>Primary Domain:</b> Ephemeral Identity / UPI", meta_style), Paragraph("<b>Institution:</b> SBCET / RTU Kota", meta_style), Paragraph("<b>Classification:</b> Confidential", meta_style)]
    ]
    meta_table = Table(meta_data, colWidths=[168, 168, 168])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_light),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 6))

    # Core Value Callout
    callout_data = [[
        Paragraph("<b>CORE VALUE PROPOSITION: \"Borrow. Do. Disappear.\"</b><br/>"
                  "PortelX establishes an ephemeral, verifiable cryptographic micro-session on an arbitrary foreign Host Device that enables critical financial transactions, sovereign document inspection, and corporate single sign-on. Upon lifecycle completion or exit trigger, the runtime executes sub-second memory shredding (&lt; 1,000ms), ensuring an absolute zero-residue digital footprint.", callout_style)
    ]]
    callout_table = Table(callout_data, colWidths=[504])
    callout_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), bg_callout),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#93C5FD")),
        ('LEFTPADDING', (0,0), (-1,-1), 9),
        ('RIGHTPADDING', (0,0), (-1,-1), 9),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(callout_table)
    story.append(Spacer(1, 6))

    story.append(Paragraph("1. Executive Summary & Problem Analysis", h1_style))
    story.append(Paragraph(
        "<b>PortelX</b> is an ephemeral identity runtime layer that enables an <b>Initiator</b> to securely project their digital identity—including payment capabilities, sovereign credentials, health records, corporate authorizations, and digital signatures—onto an arbitrary foreign <b>Host Device</b> inside a cryptographically bounded, isolated execution bubble.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The Problem:</b> Modern digital authentication rigidly binds a user's operational capabilities (UPI payment apps, corporate VPN credentials, DigiLocker storage) to a single physical device. When that hardware is incapacitated (battery exhaustion, physical damage, device theft, or confiscation during transit), users face an unbridgeable dilemma: forfeit critical access or endure high-risk credentials leakage on foreign/borrowed devices. Logging into someone else's device persists authentication cookies, cached credentials, OTPs, SMS notifications, and persistent local storage files.",
        body_style
    ))
    story.append(Paragraph(
        "<b>The PortelX Solution:</b> PortelX completely decouples operational identity from static hardware. It replaces persistent logins with temporary, isolated micro-sessions verified through Multi-Factor Biometric Attestation and zero-trust orchestration. As soon as the user completes their transaction, a sub-second cryptographic shredding routine purges all volatile memory buffers, encryption keys, and cache partitions, guaranteeing an absolute <b>zero-residue footprint</b>.",
        body_style
    ))

    # Storage vs Access Table
    story.append(Spacer(1, 3))
    story.append(Paragraph("<b>Strategic Architectural Differentiation: Access Conduit vs. Storage Vault</b>", h3_style))
    diff_data = [
        [Paragraph("Operational Dimension", table_header), Paragraph("Traditional Cloud Wallets & DigiLocker", table_header), Paragraph("PortelX Ephemeral Runtime Layer", table_header)],
        [
            Paragraph("<b>Data Storage Model</b>", table_cell_bold),
            Paragraph("Persistent file vaults. Downloads documents, PDFs, and authentication cookies directly to local flash storage.", table_cell),
            Paragraph("Pure access conduit. Streams cryptographically verified proofs into RAM capsules; zero bytes touch NAND flash.", table_cell)
        ],
        [
            Paragraph("<b>Foreign Device Residue</b>", table_cell_bold),
            Paragraph("High risk: Session cookies, cached tokens, and download histories persist indefinitely after closing.", table_cell),
            Paragraph("Zero residue: Sub-second cryptographic zeroization (&lt;1s) completely shreds memory upon session end.", table_cell)
        ],
        [
            Paragraph("<b>Device Dependency</b>", table_cell_bold),
            Paragraph("Rigidly bound to SIM cards, primary hardware IDs, and physical phone storage.", table_cell),
            Paragraph("Hardware-agnostic projection: runs securely across verified host smartphones, tablets, or kiosks.", table_cell)
        ]
    ]
    diff_table = Table(diff_data, colWidths=[114, 195, 195])
    diff_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(diff_table)

    # ==================== PAGE 2: ARCHITECTURE, BOUNDARIES & FRAUD ====================
    story.append(PageBreak())
    
    story.append(Paragraph("2. System Architecture & Zero-Trust Mechanics", h1_style))
    story.append(Paragraph(
        "PortelX operates on a high-throughput, three-tier zero-trust topology designed for sub-second lifecycle control and hardware-backed biometric verification.",
        body_style
    ))
    story.append(Paragraph("• <b>Client Tier:</b> Consists of two decoupled native applications: (1) <i>Host Device Runtime</i> (React Native) providing an isolated container with application-layer sandboxing, and (2) <i>Primary Authenticator</i> running on the user's primary hardware (or secondary trusted device) managing WebAuthn passkeys and Firebase Cloud Messaging (FCM).", bullet_style))
    story.append(Paragraph("• <b>Edge & API Tier:</b> Cloudflare API Gateway & WAF providing DDoS shielding and SSL termination, routing to high-concurrency Python 3.11 FastAPI asynchronous microservices. Backed by an in-memory Redis Ephemeral Cache running sub-second TTL key eviction.", bullet_style))
    story.append(Paragraph("• <b>Persistence & Verification Services:</b> Supabase (PostgreSQL 15+ with Row-Level Security) managing salted, pseudonymized audit logs; OpenAI Risk Engine calculating real-time behavioral anomaly scores; and RevenueCat managing dynamic subscription entitlements.", bullet_style))

    story.append(Paragraph("<b>2.1 Multi-Factor Biometric Attestation (MFA Engine):</b>", h2_style))
    story.append(Paragraph(
        "Before any temporary session capsule can be initialized on a host device, PortelX enforces strict <b>100% convergence across three distinct cryptographic factors</b> (zero partial privilege elevation permitted):",
        body_style
    ))
    story.append(Paragraph("1. <b>Live Host Facial Biometrics:</b> Real-time facial geometry attestation captured via host camera hardware and matched against encrypted vector proofs.", bullet_style))
    story.append(Paragraph("2. <b>Native Host Hardware Fingerprint:</b> Cryptographic biometric attestation queried through Android BiometricPrompt (Class 3) or iOS LocalAuthentication.", bullet_style))
    story.append(Paragraph("3. <b>Out-of-Band Primary Passkey Challenge:</b> High-entropy challenge payload pushed via WebAuthn/FIDO2 to the initiator's primary Secure Enclave.", bullet_style))
    story.append(Paragraph("• <i>Progressive Security Enforcement:</i> If sequential factor validation fails 3 consecutive times, the backend engages a progressive 300-second lockout on the user account and flags the host device fingerprint.", bullet_style))

    story.append(Paragraph("<b>2.2 Ephemeral Session Lifecycle & Sub-Second Memory Shredding:</b>", h2_style))
    story.append(Paragraph(
        "Upon successful 3-factor convergence, the backend injects an AES-256-GCM encrypted session capsule into the host runtime. The host maintains continuous vitality verification through full-duplex WebSockets. A strict, non-extendable 600-second inactivity countdown timer is enforced.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Immediate Failsafe Termination:</b> The temporary container self-destructs instantly upon: (a) transaction completion, (b) manual 'Terminate' tap, (c) WebSocket heartbeat disconnect, (d) OS window blur / app backgrounding, (e) OS device locking, or (f) timeout expiration.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Cryptographic Zeroization Routine:</b> Within <b>&lt; 1,000 milliseconds</b> of termination trigger, the client runtime overwrites all heap buffers with random bytes, zero-fills memory, flushes cache partitions, invalidates the session token on Redis, and securely shreds all ephemeral AES keys in memory.",
        body_style
    ))

    story.append(Paragraph("3. Runtime Boundaries & Autonomous Fraud Protection", h1_style))
    
    perm_data = [
        [Paragraph("Allowed Inside Session (Whitelisted)", table_header), Paragraph("Blocked by Design (Blacklisted Subsystems)", table_header)],
        [
            Paragraph("• NPCI-compliant UPI payment intent construction.<br/>"
                      "• Real-time camera BharatQR / UPI QR scanning.<br/>"
                      "• Read-only account balance querying.<br/>"
                      "• Ephemeral in-memory inspection of sovereign documents.<br/>"
                      "• Execution of cryptographically signed digital receipts.", table_cell),
            Paragraph("• <b>Filesystem:</b> Access to host photos, contacts, and storage.<br/>"
                      "• <b>Clipboard:</b> Native clipboard inspection and copy-paste blocked.<br/>"
                      "• <b>Screen Capture:</b> Screenshots and recording blocked via <code>FLAG_SECURE</code> (Android) and view masking (iOS).<br/>"
                      "• <b>IPC & Sockets:</b> Inter-process communication and foreign outbound network sockets blocked.", table_cell)
        ]
    ]
    perm_table = Table(perm_data, colWidths=[252, 252])
    perm_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_blue),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('BACKGROUND', (0,1), (-1,1), bg_light),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(perm_table)
    story.append(Spacer(1, 4))

    story.append(Paragraph("<b>Real-time Autonomous Fraud Dispatch:</b>", h2_style))
    story.append(Paragraph(
        "Within <b>5,000 milliseconds</b> of session creation, the backend pushes an out-of-band high-priority alert (FCM / APNs) to the user's primary registered hardware with: <i>Host Hardware Fingerprint, Approximate Geolocation, Counterparty, Amount, and Unix Timestamp</i>. The user selects <b>'Recognized'</b> or <b>'Dispute & Terminate'</b>. Disputes immediately freeze the session and initiate an investigative quarantine pipeline cross-referencing biometric attestation telemetry and audit logs.",
        body_style
    ))

    # ==================== PAGE 3: TECH STACK & MONETIZATION ====================
    story.append(PageBreak())
    
    story.append(Paragraph("4. Technology Stack & Subscription Tiers", h1_style))
    story.append(Paragraph(
        "The PortelX technology stack is purpose-built for maximum concurrency, cryptographic integrity, and cross-platform native execution.",
        body_style
    ))
    
    stack_data = [
        [Paragraph("Architecture Layer", table_header), Paragraph("Technology Selection", table_header), Paragraph("Technical & Architectural Rationale", table_header)],
        [Paragraph("<b>Frontend Mobile Runtime</b>", table_cell_bold), Paragraph("React Native (Expo / Bare Workflow)", table_cell), Paragraph("Rapid cross-platform native compilation for Android and iOS devices.", table_cell)],
        [Paragraph("<b>Backend API Engine</b>", table_cell_bold), Paragraph("FastAPI (Python 3.11 Asynchronous)", table_cell), Paragraph("High-concurrency async I/O, native ML compatibility, auto-generated OpenAPI.", table_cell)],
        [Paragraph("<b>Primary Database & RLS</b>", table_cell_bold), Paragraph("Supabase (PostgreSQL 15+)", table_cell), Paragraph("Instant edge data APIs, built-in Row-Level Security, real-time WebSocket subscriptions.", table_cell)],
        [Paragraph("<b>Ephemeral State Store</b>", table_cell_bold), Paragraph("Redis Cloud (Sub-second TTL)", table_cell), Paragraph("Sub-millisecond read/write latency with auto-expiring keys for session token invalidation.", table_cell)],
        [Paragraph("<b>Authentication Standard</b>", table_cell_bold), Paragraph("WebAuthn / FIDO2 + Platform Biometrics", table_cell), Paragraph("Hardware-backed asymmetric public-key cryptography; zero stored passwords.", table_cell)],
        [Paragraph("<b>Dynamic Risk Scoring</b>", table_cell_bold), Paragraph("OpenAI API (GPT-4o Mini) / Isolation Forest", table_cell), Paragraph("Low-latency behavioral risk evaluation and device anomaly classification.", table_cell)],
        [Paragraph("<b>Entitlement & Billing</b>", table_cell_bold), Paragraph("RevenueCat Mobile SDK", table_cell), Paragraph("Cross-platform receipt validation and dynamic tier feature gating.", table_cell)],
        [Paragraph("<b>Out-of-Band Push Rail</b>", table_cell_bold), Paragraph("Google Firebase Cloud Messaging (FCM)", table_cell), Paragraph("Sub-5-second high-priority delivery to initiator's primary smartphone.", table_cell)]
    ]
    stack_table = Table(stack_data, colWidths=[120, 154, 230])
    stack_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(stack_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Commercial Monetization Architecture (RevenueCat Gating):</b>", h2_style))
    tier_data = [
        [Paragraph("Feature Dimension", table_header), Paragraph("Free Tier", table_header), Paragraph("Premium Tier", table_header), Paragraph("Enterprise Tier", table_header)],
        [Paragraph("<b>Monthly Sessions</b>", table_cell_bold), Paragraph("5 Ephemeral Sessions", table_cell), Paragraph("Unlimited Sessions", table_cell), Paragraph("Uncapped / Policy Governed", table_cell)],
        [Paragraph("<b>AI Risk Scoring</b>", table_cell_bold), Paragraph("Standard Rule Checks", table_cell), Paragraph("Real-Time Behavioral AI", table_cell), Paragraph("Advanced Threat Modeling", table_cell)],
        [Paragraph("<b>Trusted Circle</b>", table_cell_bold), Paragraph("Disabled", table_cell), Paragraph("Up to 5 Family Members", table_cell), Paragraph("Multi-Tenant Org Control", table_cell)],
        [Paragraph("<b>Audit Log Cloud Sync</b>", table_cell_bold), Paragraph("Local Memory Only", table_cell), Paragraph("30-Day Encrypted Retention", table_cell), Paragraph("Infinite SIEM Log Export", table_cell)],
        [Paragraph("<b>Enterprise MDM Link</b>", table_cell_bold), Paragraph("Disabled", table_cell), Paragraph("Disabled", table_cell), Paragraph("Full Zero-Trust MDM Link", table_cell)]
    ]
    tier_table = Table(tier_data, colWidths=[114, 115, 130, 145])
    tier_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), accent_blue),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 6),
        ('RIGHTPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(tier_table)
    story.append(Spacer(1, 10))

    story.append(Paragraph("<b>Commercial Enterprise Security Rationale:</b>", h3_style))
    story.append(Paragraph(
        "While individual consumers utilize PortelX for personal emergency liquidity and travel verification, corporate enterprise accounts unlock high-margin recurring SaaS revenues. Enterprise plans empower corporate CISOs to govern contractor and travelling auditor access on external client workstations, enforcing ephemeral zero-trust boundaries with full SIEM audit compliance and zero residual corporate secrets.",
        body_style
    ))

    # ==================== PAGE 4: SECTION 5 - PHASES MATRIX, PHASE 1 & 2 ====================
    story.append(PageBreak())
    
    story.append(Paragraph("5. Phases of Project — Complete Roadmap to 100% Achievement", h1_style))
    story.append(Paragraph(
        "To achieve <b>100% full production readiness, enterprise adoption, regulatory compliance, and global scalability</b>, PortelX is structured into six comprehensive, sequential execution phases. Each phase defines explicit technical deliverables, security validation benchmarks, and quantifiable percentage progress milestones.",
        body_style
    ))
    story.append(Spacer(1, 4))

    # Master Roadmap Summary Table
    story.append(Paragraph("<b>Master Phased Implementation Matrix:</b>", h3_style))
    phase_matrix = [
        [Paragraph("Phase", table_header), Paragraph("Phase Title & Strategic Focus", table_header), Paragraph("Timeline", table_header), Paragraph("Target Progress", table_header), Paragraph("Core Milestone Deliverables", table_header)],
        [
            Paragraph("<b>Phase 1</b>", table_cell_bold),
            Paragraph("<b>Research, Cryptography & Architecture</b>", table_cell_bold),
            Paragraph("Weeks 1–3", table_cell),
            Paragraph("<b>20%</b>", table_cell_bold),
            Paragraph("Ephemeral protocol math, threat modeling, memory zeroization benchmarks, WebAuthn spec.", table_cell)
        ],
        [
            Paragraph("<b>Phase 2</b>", table_cell_bold),
            Paragraph("<b>Hackathon MVP & Proof of Concept</b>", table_cell_bold),
            Paragraph("Weeks 4–8", table_cell),
            Paragraph("<b>40%</b>", table_cell_bold),
            Paragraph("Dual React Native apps, FastAPI backend, Supabase RLS, mock UPI, OpenAI risk scoring, FCM alerts.", table_cell)
        ],
        [
            Paragraph("<b>Phase 3</b>", table_cell_bold),
            Paragraph("<b>Alpha Hardening & Biometric Bridges</b>", table_cell_bold),
            Paragraph("Months 3–4", table_cell),
            Paragraph("<b>60%</b>", table_cell_bold),
            Paragraph("Native BiometricPrompt/LocalAuth bridge, WebSocket heartbeat, sub-second shredding, VAPT audit.", table_cell)
        ],
        [
            Paragraph("<b>Phase 4</b>", table_cell_bold),
            Paragraph("<b>Beta Launch, Live Banking & Docs</b>", table_cell_bold),
            Paragraph("Months 5–7", table_cell),
            Paragraph("<b>80%</b>", table_cell_bold),
            Paragraph("NPCI-certified UPI bridge, DigiLocker memory streaming, Trusted Circle P2P, DPDPA 2023 compliance.", table_cell)
        ],
        [
            Paragraph("<b>Phase 5</b>", table_cell_bold),
            Paragraph("<b>Enterprise Suite & MDM Profiles</b>", table_cell_bold),
            Paragraph("Months 8–10", table_cell),
            Paragraph("<b>95%</b>", table_cell_bold),
            Paragraph("Corporate SAML/OIDC SSO, OEM/MDM profiles, SIEM log sync, Kubernetes scaling to 10k sessions.", table_cell)
        ],
        [
            Paragraph("<b>Phase 6</b>", table_cell_bold),
            Paragraph("<b>100% Achievement: Global Ecosystem</b>", table_cell_bold),
            Paragraph("Months 11–12+", table_cell),
            Paragraph("<b>100% COMPLETE</b>", table_cell_bold),
            Paragraph("W3C DID cross-border identity, transit/kiosk SDK, ABHA healthcare, SOC2 Type II, 99.99% SLA.", table_cell)
        ]
    ]
    matrix_table = Table(phase_matrix, colWidths=[45, 140, 55, 64, 200])
    matrix_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
    ]))
    story.append(matrix_table)
    story.append(Spacer(1, 6))

    # Phase 1 Details
    story.append(Paragraph("Phase 1: Research, Cryptographic Architecture & Core Specification (0% → 20%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Formulate the underlying cryptographic protocol, model all potential mobile attack surfaces, and prove the mathematical feasibility of volatile-only execution without persistent NAND flash storage.",
        body_style
    ))
    story.append(Paragraph("• <b>Cryptographic Protocol Formulation:</b> Define the non-reversible User Identity Token (UIT) generation algorithm and ephemeral AES-256-GCM session key derivation using cryptographically secure random number generators (CSPRNG).", bullet_style))
    story.append(Paragraph("• <b>Volatile Memory Zeroization Benchmarks:</b> Prototype low-level C and native mobile wrappers to execute memory buffer overwrites (random byte overwrite followed by zero-fill) to guarantee deallocation within 1,000ms.", bullet_style))
    story.append(Paragraph("• <b>Threat Modeling & OWASP Compliance:</b> Conduct formal threat modeling against OWASP Mobile Security Testing Guide (MSTG Level 2), documenting analog hole boundaries, screen recording vectors, and IPC leak paths.", bullet_style))
    story.append(Paragraph("• <b>WebAuthn & FIDO2 Architecture:</b> Formulate challenge-response schemas binding primary user authentication to hardware Secure Enclaves (Apple Secure Enclave and Android Titan/StrongBox MIDs).", bullet_style))

    story.append(Spacer(1, 4))
    # Phase 2 Details
    story.append(Paragraph("Phase 2: Hackathon MVP & Proof of Concept (20% → 40%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Deliver a functional, interactive end-to-end prototype demonstrated on physical mobile devices, showcasing core temporary session lifecycles, mock payment execution, and instant memory shredding.",
        body_style
    ))
    story.append(Paragraph("• <b>Dual Client Applications:</b> Build the <i>Host Runtime App</i> and <i>Primary Authenticator App</i> using React Native (Expo bare workflow) with unified UI design and seamless QR scanning.", bullet_style))
    story.append(Paragraph("• <b>Asynchronous API Engine:</b> Deploy high-concurrency FastAPI microservices integrated with Redis Cloud for ephemeral token lifecycle management and automatic TTL eviction.", bullet_style))
    story.append(Paragraph("• <b>Database & Security Rules:</b> Deploy Supabase PostgreSQL with strict Row Level Security (RLS), storing salted user profiles and anonymized, pseudonymized transaction audit logs.", bullet_style))
    story.append(Paragraph("• <b>Simulated Financial Rails:</b> Build UPI deep-link intent routing and an in-memory mock settlement ledger simulating real-time payment clearance and receipt generation.", bullet_style))
    story.append(Paragraph("• <b>AI Anomaly Demonstration:</b> Connect OpenAI API (GPT-4o Mini) to score session context (host fingerprint, time, location delta) and flag anomalous logins.", bullet_style))
    story.append(Paragraph("• <b>Commercial Entitlement & Alerts:</b> Integrate RevenueCat SDK for tier feature gating and Firebase Cloud Messaging (FCM) for real-time primary phone push alerts.", bullet_style))

    # ==================== PAGE 5: PHASE 3, 4 & 5 ====================
    story.append(PageBreak())
    
    # Phase 3 Details
    story.append(Paragraph("Phase 3: Alpha Testing, Native Hardware Attestation & Security Hardening (40% → 60%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Transition from mock and application-layer wrappers to native hardware-enforced biometrics, robust session state synchronization, and rigorous penetration testing.",
        body_style
    ))
    story.append(Paragraph("• <b>Native Hardware Biometrics Bridge:</b> Replace simulated authentication with native bridges to Android BiometricPrompt (Class 3 Strong Biometric hardware) and iOS LocalAuthentication / FaceID.", bullet_style))
    story.append(Paragraph("• <b>Full-Duplex Vitality Heartbeat:</b> Deploy WebSocket edge routing that continuously validates session vitality; any socket disruption, network loss, or app backgrounding triggers immediate local shredding.", bullet_style))
    story.append(Paragraph("• <b>Progressive Security Rate Limiting:</b> Implement progressive backend lockouts (300 seconds following 3 consecutive factor failures) to eliminate brute-force attack vectors.", bullet_style))
    story.append(Paragraph("• <b>Automated Dispute & Quarantine Engine:</b> Build the server-side investigative pipeline that freezes tokens and cross-references attestation logs when a user taps 'Dispute & Terminate'.", bullet_style))
    story.append(Paragraph("• <b>Vulnerability Assessment & Pen Testing (VAPT):</b> Engage external ethical security researchers for comprehensive SAST, DAST, and reverse-engineering testing (Frida hooking, jailbreak bypass resistance).", bullet_style))

    story.append(Spacer(1, 5))
    # Phase 4 Details
    story.append(Paragraph("Phase 4: Beta Launch, Banking Gateway Partnerships & Sovereign Documents (60% → 80%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Replace simulated financial flows with certified NPCI banking rails, integrate national document repositories, and conduct closed beta user trials.",
        body_style
    ))
    story.append(Paragraph("• <b>Production UPI & Payment Gateway Clearing:</b> Establish banking sponsorship and integrate certified Payment Aggregator (PA) APIs for real-time live UPI settlement with NPCI compliance.", bullet_style))
    story.append(Paragraph("• <b>DigiLocker & Sovereign Document Streaming:</b> Connect with DigiLocker and health repositories to allow read-only document inspection directly in memory capsules, strictly prohibiting local file caching.", bullet_style))
    story.append(Paragraph("• <b>Trusted Circle Peer-to-Peer Network:</b> Implement cryptographic peer-to-peer invitation and verification, enabling users to designate trusted family, friends, or corporate colleagues as verified host nodes.", bullet_style))
    story.append(Paragraph("• <b>Closed User Group (CUG) Public Beta:</b> Roll out production beta builds to 1,000+ selected users across diverse mobile hardware, capturing telemetry, latency metrics, and real-world failure cases.", bullet_style))
    story.append(Paragraph("• <b>Regulatory Privacy Compliance:</b> Perform formal legal and technical audit under the India Digital Personal Data Protection Act (DPDPA 2023) and GDPR, enabling automated 'Right to Erasure' API endpoints.", bullet_style))

    story.append(Spacer(1, 5))
    # Phase 5 Details
    story.append(Paragraph("Phase 5: Enterprise Fleet Management & Mobile Device Management (MDM) (80% → 95%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Unlock enterprise B2B monetization by integrating enterprise identity providers (IdPs), Mobile Device Management (MDM) profiles, and organizational compliance consoles.",
        body_style
    ))
    story.append(Paragraph("• <b>Corporate Identity Federation (SSO):</b> Support enterprise SAML 2.0 and OIDC identity federation, allowing travelling executives and contractors to launch temporary single sign-on corporate sessions.", bullet_style))
    story.append(Paragraph("• <b>OEM & Enterprise MDM Sandbox Profiles:</b> Partner with MDM systems (Android Enterprise, Apple Knox, Jamf) to enforce kernel-level display capture negation and operating system clipboard isolation.", bullet_style))
    story.append(Paragraph("• <b>Centralized Enterprise Administration Console:</b> Deliver a web dashboard for enterprise sysadmins to monitor active fleet sessions, configure device whitelists, review compliance digests, and trigger instant remote revocations.", bullet_style))
    story.append(Paragraph("• <b>Enterprise SIEM Log Export:</b> Automate real-time streaming of encrypted, pseudonymized security event logs into enterprise SIEM platforms (Splunk, Datadog, AWS CloudWatch, IBM QRadar).", bullet_style))
    story.append(Paragraph("• <b>Cloud Infrastructure Horizontal Scaling:</b> Containerize backend microservices on Kubernetes across multi-region Cloudflare edge clusters, stress-tested to sustain 10,000+ concurrent active sessions.", bullet_style))

    # ==================== PAGE 6: PHASE 6 & GOVERNANCE ====================
    story.append(PageBreak())
    
    # Phase 6 Details
    story.append(Paragraph("Phase 6: 100% Achievement — Global Production, Hardware Enclaves & Ecosystem Scale (95% → 100%)", h2_style))
    story.append(Paragraph(
        "<b>Strategic Objective:</b> Complete the strategic evolution into a globally recognized temporary identity standard, expanding into international cross-border identity capsules, public transit/kiosk SDKs, and critical healthcare.",
        body_style
    ))
    story.append(Paragraph("• <b>W3C Decentralized Identifiers (DID) & Verifiable Credentials:</b> Implement W3C-compliant self-sovereign identity standards for cross-border digital passports, travel visas, and international credentials.", bullet_style))
    story.append(Paragraph("• <b>Hardware FIDO2 Security Keys Support:</b> Support physical security keys (YubiKey, Google Titan) via NFC and USB-C for offline and zero-network passkey attestation.", bullet_style))
    story.append(Paragraph("• <b>Public Kiosk & Transit Terminal SDK:</b> Deliver hardened kiosk runtime binaries for airport self-service check-in, high-speed train transit gates, and hospitality self-check-in kiosks.", bullet_style))
    story.append(Paragraph("• <b>Emergency Healthcare Dossier Access:</b> Integrate Ayushman Bharat Health Account (ABHA) and international health standards for emergency medical personnel access during critical accidents.", bullet_style))
    story.append(Paragraph("• <b>Formal Industry Certifications:</b> Secure formal SOC 2 Type II certification, ISO/IEC 27001 accreditation, and CERT-In empanelled audit sign-off.", bullet_style))
    story.append(Paragraph("• <b>High Availability SLA:</b> Formalize 99.99% core infrastructure uptime availability backed by 24/7 global follow-the-sun enterprise engineering support.", bullet_style))

    story.append(Spacer(1, 10))
    story.append(Paragraph("6. Project Governance, Revision History & Author Affiliation", h1_style))
    story.append(Paragraph(
        "PortelX is governed under rigorous engineering management protocols ensuring architectural lineage, traceability of non-functional constraints, and cryptographic auditability across all execution milestones.",
        body_style
    ))
    story.append(Spacer(1, 4))
    
    gov_data = [
        [Paragraph("Governance Parameter", table_header), Paragraph("Specification Details", table_header)],
        [Paragraph("<b>Project Identifier</b>", table_cell_bold), Paragraph("<b>PortelX</b> — Universal Temporary Identity Layer", table_cell)],
        [Paragraph("<b>Document Identifier</b>", table_cell_bold), Paragraph("PORTELX-SRS-2026-V1.0", table_cell)],
        [Paragraph("<b>Publication Date</b>", table_cell_bold), Paragraph("12 September 2026", table_cell)],
        [Paragraph("<b>Lead System Architect</b>", table_cell_bold), Paragraph("Himanshu Badgujar", table_cell)],
        [Paragraph("<b>Academic Program</b>", table_cell_bold), Paragraph("B.Tech in Computer Science & Engineering (Specialization: Cybersecurity)", table_cell)],
        [Paragraph("<b>Institution</b>", table_cell_bold), Paragraph("Sri Balaji College of Engineering and Technology (SBCET), Jaipur", table_cell)],
        [Paragraph("<b>University Affiliation</b>", table_cell_bold), Paragraph("Rajasthan Technical University (RTU), Kota | Roll No: 23ESBCS026", table_cell)],
        [Paragraph("<b>Contact & Inquiries</b>", table_cell_bold), Paragraph("hbadgujar517@gmail.com", table_cell)],
        [Paragraph("<b>Implementation Status</b>", table_cell_bold), Paragraph("<b>Approved for Development & Phased Rollout (0% → 100%)</b>", table_cell_bold)]
    ]
    gov_table = Table(gov_data, colWidths=[160, 344])
    gov_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('BOX', (0,0), (-1,-1), 0.75, border_color),
        ('INNERGRID', (0,0), (-1,-1), 0.5, border_color),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, bg_light]),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 7),
        ('RIGHTPADDING', (0,0), (-1,-1), 7),
    ]))
    story.append(gov_table)
    
    # Build Document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == '__main__':
    create_portelx_pdf()
