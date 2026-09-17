import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma.service';

@Injectable()
export class CmsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // =====================================================
  // WEBSITE PAGES
  // =====================================================

  async createPage(data: any) {
    return this.prisma.websitePage.create({
      data,
    });
  }

  async findAllPages() {
    return this.prisma.websitePage.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findPage(id: number) {
    const page =
      await this.prisma.websitePage.findUnique({
        where: { id },
      });

    if (!page) {
      throw new NotFoundException(
        `Website page with ID ${id} not found`,
      );
    }

    return page;
  }

  async updatePage(
    id: number,
    data: any,
  ) {
    await this.findPage(id);

    return this.prisma.websitePage.update({
      where: { id },
      data,
    });
  }

  async deletePage(id: number) {
    await this.findPage(id);

    return this.prisma.websitePage.delete({
      where: { id },
    });
  }

  // =====================================================
  // BLOGS
  // =====================================================

  async createBlog(data: any) {
    return this.prisma.blog.create({
      data,
    });
  }

  async findAllBlogs() {
    return this.prisma.blog.findMany({
      orderBy: {
        updatedAt: 'desc',
      },
    });
  }

  async findBlog(id: number) {
    const blog =
      await this.prisma.blog.findUnique({
        where: { id },
      });

    if (!blog) {
      throw new NotFoundException(
        `Blog with ID ${id} not found`,
      );
    }

    return blog;
  }

  async updateBlog(
    id: number,
    data: any,
  ) {
    await this.findBlog(id);

    return this.prisma.blog.update({
      where: { id },
      data,
    });
  }

  async deleteBlog(id: number) {
    await this.findBlog(id);

    return this.prisma.blog.delete({
      where: { id },
    });
  }

  // =====================================================
  // EVENTS
  // =====================================================

  async createEvent(data: any) {
    return this.prisma.event.create({
      data,
    });
  }

  async findAllEvents() {
    return this.prisma.event.findMany({
      orderBy: {
        eventDate: 'asc',
      },
    });
  }

  async findEvent(id: number) {
    const event =
      await this.prisma.event.findUnique({
        where: { id },
      });

    if (!event) {
      throw new NotFoundException(
        `Event with ID ${id} not found`,
      );
    }

    return event;
  }

  async updateEvent(
    id: number,
    data: any,
  ) {
    await this.findEvent(id);

    return this.prisma.event.update({
      where: { id },
      data,
    });
  }

  async deleteEvent(id: number) {
    await this.findEvent(id);

    return this.prisma.event.delete({
      where: { id },
    });
  }

  // =====================================================
  // FAQs
  // =====================================================

  async createFaq(data: any) {
    return this.prisma.faq.create({
      data,
    });
  }

  async findAllFaqs() {
    return this.prisma.faq.findMany({
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findFaq(id: number) {
    const faq =
      await this.prisma.faq.findUnique({
        where: { id },
      });

    if (!faq) {
      throw new NotFoundException(
        `FAQ with ID ${id} not found`,
      );
    }

    return faq;
  }

  async updateFaq(
    id: number,
    data: any,
  ) {
    await this.findFaq(id);

    return this.prisma.faq.update({
      where: { id },
      data,
    });
  }

  async deleteFaq(id: number) {
    await this.findFaq(id);

    return this.prisma.faq.delete({
      where: { id },
    });
  }

  // =====================================================
  // TEAM MEMBERS
  // =====================================================

  async createTeamMember(data: any) {
    return this.prisma.teamMember.create({
      data,
    });
  }

  async findAllTeamMembers() {
    return this.prisma.teamMember.findMany({
      orderBy: [
        {
          displayOrder: 'asc',
        },
        {
          createdAt: 'desc',
        },
      ],
    });
  }

  async findTeamMember(id: number) {
    const teamMember =
      await this.prisma.teamMember.findUnique({
        where: { id },
      });

    if (!teamMember) {
      throw new NotFoundException(
        `Team member with ID ${id} not found`,
      );
    }

    return teamMember;
  }

  async updateTeamMember(
    id: number,
    data: any,
  ) {
    await this.findTeamMember(id);

    return this.prisma.teamMember.update({
      where: { id },
      data,
    });
  }

  async deleteTeamMember(id: number) {
    await this.findTeamMember(id);

    return this.prisma.teamMember.delete({
      where: { id },
    });
  }
}