// ABOUTME: The voice-over, one passage per scene, in the first person of the talk.
// ABOUTME: Condensed from the deck's speaker notes; scripts/narrate.mjs turns it into audio and timing.

export const NARRATION: Record<string, string> = {
  orbit:
    "Governing MCP for a workforce the size of a city. So what do we mean by a city? Let me put it in ships. Star Trek called the Enterprise a whole city in space: four hundred and twenty-eight people. The Enterprise-D, about a thousand. Galactica, twenty-eight hundred. The Infinity, seventeen thousand. A Star Destroyer, thirty-seven thousand. The Executor, two hundred and eighty thousand. And the Death Star, one point two million. I cannot tell you our exact number. So let us call it two-thirds of a Death Star.",
  cables:
    "You hear this a lot: MCP is the USB of AI tooling. I do not disagree. But does anyone remember the early days of USB? Parallel. Serial. PS/2. Is that A? Is that Mini? Is that Micro? Which way up does it go? USB 1.0 shipped in January 1996. USB-C arrived in August 2014. Eighteen years to get to one plug. MCP will get there faster. But we are not at USB-C yet.",
  expected:
    "Now, I lied to you. The title says governance at scale, so you expected the architecture, the number, the process, the security incidents, and wrapping MCP servers in MCP servers. Other people here have covered all of these, and I can answer every one. So let me do that quickly.",
  city:
    "The architecture, the simple version: a person, an agent, one gate that every call goes through, and the tools. Done properly, that gate becomes a proxy and a gateway, with identity, authorization, policy and rate limits enforced once. Model traffic goes through its own gateway. The control plane feeds it all: identity, the registries, workload identity, GitOps with admission control. And everything that goes through a gateway is audited.",
  gates:
    "The process. Six gates, and a request passes through them in order. Do we know the vendor? Is there a real need, and is it core? How well is it built, and does it need wrapping? Does it speak the current spec? Does it carry authorization? And is the vendor itself compliant? Pass all six, and the server is admitted.",
  attack:
    "The security incidents. Look at this little gem: one line in a log file. An attacker plants it. Later, an operator asks an agent to read the logs, and the agent reads the planted instruction along with everything else. It runs kubectl against a server the attacker controls, with TLS verification switched off. kubectl sends the operator's bearer token. The attacker replays it. No model was jailbroken. No policy was violated. Every call in that chain was authorized.",
  wrapped:
    "And wrapping. We wrapped MCP servers in MCP servers. We thought that was new. It is not. USB, wrapped in USB. We did it when a server carried no authorization, when it needed a credential the client must never hold, when it exposed a hundred tools and the model should see nine, when it spoke the wrong transport, when every call had to be logged, and when one tool did both reads and writes, so we wrapped that server twice. One test tells you whether a wrapper is built right: is the credential that reaches the upstream different from the one the client sent?",
  whatif:
    "But here is what I really want to talk about. What if you gave your end users generative AI, and MCP, and then told them: use AI! Explore! Experiment! You have handed everyone a relentless hacker, running on your hardware, inside your security zones, with your tokens and your tools. So what happens when you tell people with superpowers no?",
  theno:
    "A user comes to you and says: I want to give the agent access to my email. Read my email? Yes. Draft replies for me? Fine. Send email as me? Whoa. Hold on. So we said no. We offered alternatives. And the user asked the agent: I don't see an MCP server for Outlook. Is there some other way we might do this?",
  sayno:
    "The agent wrote PowerShell against classic Outlook's own automation interface, and on a healthy, managed laptop it went straight through. Then they asked about Teams. We said no again. So they took the approved browser, turned on remote debugging, and the agent walked the browser through Teams and Outlook. Nothing on those alleys goes through a gateway. Nothing is logged. Your people did not accept the no. They routed around it, with the tools you handed them.",
  acceptance:
    "That is psychological acceptance, and for security it is now more important than ever. You cannot wait this one out: block the approved server, and an unapproved one appears. We handed a three-year-old the markers and said: you can write on the wall now. Do you go after the minions, or the summoner? The summoner is the heart and mind we need to win. Twenty years of no, and then we handed out magic and said: stay inside the lines.",
  close:
    "Start talking to your users. If you will not win their hearts and minds, you will not win at security. That is how you govern a workforce the size of a city: you win the people, while you still stand at the gate. MCP will get to its USB-C faster than anything we have seen. But only if we bring the people with us. The details are at mcp dot michael rishi forrester dot com. Come find me.",
};
